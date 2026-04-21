const VERSION = "mozg-site-abpcm-v10";
const HOME_PATH = "/node-vitepress-abpcm/";
const APP_SHELL = [
  "/node-vitepress-abpcm/",
  "/node-vitepress-abpcm/manifest.json",
  "/node-vitepress-abpcm/logo-mini.svg",
  "/node-vitepress-abpcm/logo-mini.png",
  "/node-vitepress-abpcm/og.jpg",
  "/node-vitepress-abpcm/data/site-catalog.json",
  "/node-vitepress-abpcm/data/site-audit.json",
  "/node-vitepress-abpcm/data/site-discovery.json",
  "/node-vitepress-abpcm/data/site-portfolio.json",
  "/node-vitepress-abpcm/data/site-projects.json",
  "/node-vitepress-abpcm/data/site-capabilities.json",
  "/node-vitepress-abpcm/data/site-stacks.json",
  "/node-vitepress-abpcm/data/site-operations.json",
  "/node-vitepress-abpcm/data/site-journeys.json",
  "/node-vitepress-abpcm/data/site-trust.json",
  "/node-vitepress-abpcm/llms.txt",
  "/node-vitepress-abpcm/robots.txt",
  "/node-vitepress-abpcm/contato",
  "/node-vitepress-abpcm/presenca",
  "/node-vitepress-abpcm/en/",
  "/node-vitepress-abpcm/en/contact",
  "/node-vitepress-abpcm/en/presence"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
