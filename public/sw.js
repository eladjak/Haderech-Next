const CACHE_NAME = "haderech-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/images/haderech-logo-square.jpg",
  "/images/haderech-icon.jpg",
];

// Install - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Push - show notification from server push
self.addEventListener("push", (event) => {
  let data = {
    title: "הדרך נקסט",
    body: "יש עדכון חדש עבורך",
    icon: "/images/haderech-icon.jpg",
    badge: "/images/haderech-icon.jpg",
    url: "/dashboard",
    tag: "haderech-notification",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: { url: data.url },
      requireInteraction: false,
      silent: false,
    })
  );
});

// Notification click - open the app at the specified URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/dashboard";
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // אם כבר יש חלון פתוח - נווט אליו
        for (const client of clientList) {
          if (client.url === fullUrl && "focus" in client) {
            return client.focus();
          }
        }
        // אחרת פתח חלון חדש
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Notification close - track dismissals (optional analytics)
self.addEventListener("notificationclose", (_event) => {
  // ניתן לשלוח analytics event כאן בעתיד
});

// Fetch - network first, fallback to cache, then offline page
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }

  // For other requests: cache first for static assets, network first for API
  if (event.request.url.includes("/images/") || event.request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  event.respondWith(fetch(event.request));
});
