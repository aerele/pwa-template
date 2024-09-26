self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open('static-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.png',
        '/assets/pwa_template/manifest/images_pwa_app.png', // Add static assets here
        '/src/main.js', // Include any other necessary assets
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated...');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
  