/* BestLife: кэширование картинок и шрифтов, чтобы при следующем запуске они были уже на устройстве.
   Картинки отдаются из кэша мгновенно, а в фоне дёшево проверяются на обновление (ответ 304 почти ничего не весит). */
const CACHE_NAME = 'bestlife-images-v2';
const FONT_CACHE = 'bestlife-fonts-v1';

self.addEventListener('install', function () {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME && key !== FONT_CACHE; }).map(function (key) { return caches.delete(key); }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    /* Шрифты Google: один раз скачали и дальше берём с устройства */
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.open(FONT_CACHE).then(function (cache) {
                return cache.match(request).then(function (cached) {
                    if (cached) return cached;
                    return fetch(request).then(function (response) {
                        if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
                        return response;
                    });
                });
            })
        );
        return;
    }

    if (url.origin !== self.location.origin) return;
    if (!/\.(png|jpg|jpeg|webp)$/i.test(url.pathname)) return;
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(request).then(function (cached) {
                /* Если картинка уже на устройстве, она показывается сразу, а обновление проверяется тихо (без повторной загрузки целиком) */
                if (cached) {
                    fetch(request, { cache: 'no-cache' }).then(function (response) {
                        if (response && response.ok) cache.put(request, response.clone());
                    }).catch(function () {});
                    return cached;
                }
                return fetch(request).then(function (response) {
                    if (response && response.ok) cache.put(request, response.clone());
                    return response;
                });
            });
        })
    );
});
