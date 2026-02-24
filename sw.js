const CACHE_NAME = 'autoridades-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './autoridades.html',
    './styles.css',
    './app.js',
    './autoridades.js',
    './data.js',
    './supabase-config.js',
    './Escudo oro.png',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Fuerza a que el SW nuevo se active inmediatamente
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Tomar control inmediato de todas las pestañas abiertas
});

// Estrategia Network First (Red primero, si falla va a Caché)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones a Supabase y otros dominios externos
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Red funcionó: clonar y guardar en caché la versión más reciente
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Modo offline: devolver lo que haya en caché
                return caches.match(event.request);
            })
    );
});
