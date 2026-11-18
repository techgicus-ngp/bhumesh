/* Background push for plot-status changes.
   Firebase config is passed in the registration URL query string by pushService.js
   (a service worker cannot read import.meta.env). */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const p = new URL(self.location).searchParams;
firebase.initializeApp({
  apiKey: p.get('apiKey'),
  authDomain: p.get('authDomain'),
  projectId: p.get('projectId'),
  storageBucket: p.get('storageBucket'),
  messagingSenderId: p.get('messagingSenderId'),
  appId: p.get('appId'),
});

// Messages sent with a `notification` payload are displayed automatically by the SDK.
firebase.messaging();

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.FCM_MSG?.data?.link
    || event.notification.data?.link
    || '/';
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) { await c.focus(); if ('navigate' in c) await c.navigate(link); return; }
    }
    await clients.openWindow(link);
  })());
});
