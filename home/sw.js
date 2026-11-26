/* Gate Call web app: shows call alerts from the server (web push) and opens the app on tap. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Gate Call', body: e.data ? e.data.text() : '' }; }
  var call = d.type === 'call';
  e.waitUntil(self.registration.showNotification(d.title || 'Gate Call', {
    body: d.body || '', tag: d.tag || 'gatecall', renotify: true, requireInteraction: call,
    icon: 'icon-192.png', badge: 'icon-192.png', vibrate: call ? [600, 300, 600, 300, 600, 300, 600] : [200],
    data: { type: d.type, visitId: d.visitId },
  }).then(function () {
    // If the app is open, tell it straight away.
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) { list.forEach(function (c) { c.postMessage({ type: d.type, visitId: d.visitId }); }); });
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var d = e.notification.data || {};
  var url = new URL(d.type === 'call' && d.visitId ? './?call=' + d.visitId : './#visitors', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { var c = list[i]; if (c.url.indexOf(self.registration.scope) === 0) { c.postMessage({ type: d.type, visitId: d.visitId }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
