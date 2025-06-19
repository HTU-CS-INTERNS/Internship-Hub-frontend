
// public/custom-sw.js

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data?.text()}"`);

  const title = 'InternshipTrack';
  const options = {
    body: event.data?.text() || 'You have a new notification!',
    icon: '/icons/icon-192x192.png', // Path to your app icon
    badge: '/icons/icon-72x72.png', // Path to a smaller badge icon
    // You can add more options like actions, vibrate, etc.
    data: {
      url: event.data?.json()?.url || '/', // Get URL from push data if available
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// You can add more service worker logic here if needed,
// like background sync, periodic sync, etc.
// next-pwa will still handle the caching strategies for assets.
