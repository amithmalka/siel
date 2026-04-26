'use client'

import { useEffect } from 'react'

interface Props {
  role: 'beauty_pro' | 'rabbi'
  entityId: string  // provider_id or rabbi_id
}

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

export default function PushSubscriber({ role, entityId }: Props) {
  useEffect(() => {
    const key = VAPID_KEY
    if (!key || !('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key),
          })
        }

        const endpoint = role === 'rabbi' ? '/api/rabbi-push-subscribe' : '/api/push-subscribe'
        const body = role === 'rabbi'
          ? { subscription: sub.toJSON(), rabbiId: entityId }
          : { subscription: sub.toJSON(), providerId: entityId }

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } catch {
        // Notification permission denied or not supported
      }
    }

    subscribe()
  }, [role, entityId])

  return null
}
