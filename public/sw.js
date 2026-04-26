self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'SIEL', {
      body: data.body ?? '',
      icon: '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      dir: 'rtl',
      lang: 'he',
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(self.registration.scope))
      if (existing) { existing.focus(); return existing.navigate(url) }
      return clients.openWindow(url)
    })
  )
})
