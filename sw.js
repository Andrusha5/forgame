/* BestLife: кэширование картинок, чтобы при следующем запуске они были уже на устройстве.
   Картинки отдаются из кэша сразу, а в фоне обновляются, поэтому новые файлы подтянутся при следующем входе. */
const CACHE_NAME = 'bestlife-images-v1';

self.addEventListener('install', function () {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (!/\.(png|jpg|jpeg|webp)$/i.test(url.pathname)) return;
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(request).then(function (cached) {
                const network = fetch(request).then(function (response) {
                    if (response && response.ok) cache.put(request, response.clone());
                    return response;
                }).catch(function () { return cached; });
                return cached || network;
            });
        })
    );
});
