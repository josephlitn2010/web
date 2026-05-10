// Service Worker with advanced update mechanism
// Version: 20260416 - Update this number on each deployment
const VERSION = '20260416';
const CACHE_NAME = `vocablearn-cache-v${VERSION}`;
const RUNTIME_CACHE = `vocablearn-runtime-v${VERSION}`;

// Critical files that must be cached immediately
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential files and take control immediately
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Service Worker v${VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log(`[SW] Caching critical files to ${CACHE_NAME}`);
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn('[SW] Some resources failed to cache:', err);
        });
      }),
      // Notify all clients about new version
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_INSTALLED',
            version: VERSION
          });
        });
      })
    ])
  );
  
  // Skip waiting - take control immediately without waiting for old SW to close
  self.skipWaiting();
});

// Activate event - clean up old caches and claim all clients
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating Service Worker v${VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        console.log('[SW] Cleaning up old caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match current version
            if (!cacheName.includes(VERSION)) {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately - no need to wait for page reload
      self.clients.claim().then(() => {
        console.log('[SW] Claimed all clients');
      })
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Special handling for index.html and sw.js - always check network first
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/sw.js') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
            .then((response) => response || caches.match('/index.html'));
        })
    );
    return;
  }

  // For other resources: cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses for future use
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return cached response if network fails
        return caches.match(event.request)
          .then((response) => response || caches.match('/index.html'));
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
