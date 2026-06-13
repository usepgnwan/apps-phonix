self.addEventListener('install', (event) => {
    // Basic service worker install
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass-through fetch for now, can implement offline caching later
    event.respondWith(fetch(event.request));
});
