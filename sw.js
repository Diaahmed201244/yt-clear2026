// /sw.js - PWA Service Worker with improved cache strategy
const CACHE_NAME = 'drd-yt-v2';
const CRITICAL_ASSETS = [
    '/yt-new-clear.html',
    '/styles/style.css',
    '/styles/youtube-embed-responsive.css',
    '/styles/toggle-switch-3way.css',
    '/styles/section-switch-popup.css',
    '/codebank/css/safe-asset-list.css',
    '/manifest.json',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching critical assets');
            return cache.addAll(CRITICAL_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Network first, cache fallback for HTML navigation
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;

    // Network first for HTML pages
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache the fresh response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then((cached) => cached || caches.match('/yt-new-clear.html'));
                })
        );
        return;
    }

    // Cache first for static assets (CSS, JS, images)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached and update in background
                fetch(event.request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});
