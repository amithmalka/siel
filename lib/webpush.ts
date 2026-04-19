import webpush from 'web-push'

let initialized = false

function init() {
  if (initialized) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@siel.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  initialized = true
}

export async function sendWebPush(
  subscription: webpush.PushSubscription,
  title: string,
  body: string,
) {
  init()
  await webpush.sendNotification(subscription, JSON.stringify({ title, body }))
}
