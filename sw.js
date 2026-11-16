
const CACHE_NAME = "koine-lab-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// 第一次访问时缓存核心文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 清理旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) =>
            name.startsWith("koine-lab-") &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// 优先使用缓存，离线也能启动
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(
        new URL(self.registration.scope).pathname
      )) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
