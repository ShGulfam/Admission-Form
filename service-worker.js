// service-worker.js

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

// Fetch event (optional)
self.addEventListener('fetch', function(event) {
  // You can add caching strategies here if needed
});
