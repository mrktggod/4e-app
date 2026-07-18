const PWA_VERSION = "tma-diag-2026-07-18-urgent2";
const PWA_CACHE = `4-pwa-shell-${PWA_VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.min.css",
  "/favicon.svg",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/scripts/tma-diagnostics.js",
  "/scripts/platform-adapter.js",
  "/scripts/auth.js",
  "/scripts/auth-handlers.js",
  "/scripts/task-ui-renderers.js",
  "/assets/vendor/telegram-web-app.js",
  "/assets/vendor/vk-bridge.min.js",
  "/assets/vendor/marked.min.js"
];

function cacheBustUrl(request) {
  const url = new URL(request.url);
  url.searchParams.set("__sw_version", PWA_VERSION);
  return url.toString();
}

async function putFresh(cacheKey, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(PWA_CACHE);
  await cache.put(cacheKey, response.clone());
  return response;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PWA_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map((asset) =>
          fetch(`${asset}?__sw_install=${PWA_VERSION}`, { cache: "reload" }).then((response) => {
            if (response && response.ok) return cache.put(asset, response);
            return null;
          })
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("4-pwa-shell-") && key !== PWA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(cacheBustUrl(request), { cache: "reload", credentials: "include" })
        .then((response) => putFresh("/index.html", response))
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  const networkFirst = url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname === "/sw.js" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".webmanifest");

  if (networkFirst) {
    event.respondWith(
      fetch(cacheBustUrl(request), { cache: "reload", credentials: "include" })
        .then((response) => putFresh(request, response))
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => putFresh(request, response))
        .catch(() => cached);
      return cached || network;
    })
  );
});
