// Service Worker for Web Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'SIEL', {
      body: data.body ?? '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      dir: 'rtl',
      lang: 'he',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/rabbi'))
})
