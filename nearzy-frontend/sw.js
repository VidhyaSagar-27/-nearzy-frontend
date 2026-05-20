const CACHE = "nearzy-v5";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      "./",
      "./index.html"
    ]).catch(() => {}))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  if (url.includes("nearzy-backend.onrender.com")) return;
  if (url.includes("razorpay")) return;
  if (url.includes("api.anthropic")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Nearzy", {
      body: data.body || "You have an update",
      icon: "https://placehold.co/192x192/fc8019/fff?text=N",
      badge: "https://placehold.co/72x72/fc8019/fff?text=N",
      tag: "nearzy",
      vibrate: [200, 100, 200],
      data: { url: data.url || "./" }
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:"window", includeUncontrolled:true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow(e.notification.data?.url || "./");
    })
  );
});

self.addEventListener("message", e => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});