const CACHE_NAME = 'cyberguard-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/data.js',
    './js/game.js',
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
    './icons/icon-192x192.jpg',
    './icons/icon-512x512.jpg',
    // Додаємо звуки:
    './sounds/click.mp3',
    './sounds/success.mp3',
    './sounds/error.mp3'
];

// 1. Встановлення (кешуємо файли)
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Активація (чистимо старі кеші, якщо оновили версію)
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. Перехоплення запитів (Offline mode)
self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        caches.match(evt.request).then((response) => {
            // Якщо є в кеші - повертаємо з кешу, інакше - качаємо з інтернету
            return response || fetch(evt.request);
        })
    );

});



