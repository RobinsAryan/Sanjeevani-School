const CACHE_NAME = 'v1';

const staticAssets = [

    '/img/noData.gif',
    '/img/swrong.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url); 
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/) || url.pathname.match(/\.(woff|woff2|eot|ttf|otf)$/)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                }).catch(() => {
                    return caches.match('/offline.html');
                });
            })
        )
    }
    else {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/offline.html');
            }));
    }
});



self.addEventListener('push', (event) => {
    console.log(event.data);
    let data = JSON.parse(event.data.text());
    const options = {
        body: data.body,
        icon: './img/hero.jpg',
        badge: './img/hero.jpg',
        tag: 'announc',

    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close(); 
    event.waitUntil(
        clients.openWindow('https://app.thesanjeevanischool.in/notifications')
    );
});
