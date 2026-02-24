const CACHE_NAME = 'autoridades-v1';
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
    './apple-touch-icon.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Devuelve la respuesta caché si existe, o haz el fetch
            return response || fetch(event.request);
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
});
