const PWA_CACHE = "4-pwa-shell-v20260719-light-qa-polish-1";

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.min.css",
  "/favicon.svg",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/scripts/platform-adapter.js",
  "/scripts/auth.js",
  "/scripts/auth-handlers.js",
  "/scripts/task-ui-renderers.js",
  "/assets/vendor/telegram-web-app.js",
  "/assets/vendor/vk-bridge.min.js",
  "/assets/vendor/marked.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PWA_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map((asset) =>
          fetch(asset, { cache: "reload" }).then((response) => {
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
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("4-pwa-shell-") && key !== PWA_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PWA_CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(PWA_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
