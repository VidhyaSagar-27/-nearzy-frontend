const CACHE = "nearzy-v1";
const STATIC = [
  "/",
  "/index.html",
  "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,600;0,14..32,700;0,14..32,800&family=Sora:wght@400;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
];

// Install — cache static assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", e => {
  // Don't intercept API calls or POST requests
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("nearzy-backend.onrender.com")) return;
  if (e.request.url.includes("razorpay")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification handler
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Nearzy", {
      body: data.body || "You have an update",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "nearzy-order",
      renotify: true,
      data: { url: data.url || "/" }
    })
  );
});

// Notification click — open the app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow(e.notification.data?.url || "/");
    })
  );
});