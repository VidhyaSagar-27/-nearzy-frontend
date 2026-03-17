const CACHE = "nearzy-v4";
const BASE = "/nearzy-frontend";
const STATIC = [
  BASE + "/",
  BASE + "/index.html",
  "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,600;0,14..32,700;0,14..32,800&family=Sora:wght@400;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
  self.skipWaiting();
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
  // Skip API, payment, analytics
  if (url.includes("nearzy-backend.onrender.com")) return;
  if (url.includes("razorpay")) return;
  if (url.includes("postalpincode.in")) return;
  if (url.includes("nominatim.openstreetmap")) return;
  if (url.includes("chart.googleapis.com")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match(BASE + "/index.html")))
  );
});

self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Nearzy", {
      body: data.body || "You have an update from Nearzy",
      icon: "https://placehold.co/192x192/fc8019/fff?text=N",
      badge: "https://placehold.co/72x72/fc8019/fff?text=N",
      tag: data.tag || "nearzy-notif",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || BASE + "/" }
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const existing = list.find(w => w.url.includes("nearzy-frontend"));
      if (existing) { existing.focus(); existing.postMessage({ type: "NOTIFICATION_CLICK", url: e.notification.data?.url }); return; }
      return clients.openWindow(e.notification.data?.url || BASE + "/");
    })
  );
});

self.addEventListener("message", e => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});