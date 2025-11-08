"use client"
import { useEffect, useState } from 'react'

export function useWhatsAppPhone() {
  const [phone, setPhone] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      // Intento rápido: si alguna var pública existe ya en bundle
      const inline = (process.env.NEXT_PUBLIC_WAPP || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '')
      if (inline) {
        setPhone(inline)
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/config/whatsapp')
        if (!res.ok) throw new Error('fetch whatsapp config failed')
        const data = await res.json()
        if (active) {
          setPhone(data.phone || '')
        }
      } catch (e) {
        console.warn('[useWhatsAppPhone] error', (e as any)?.message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return { phone, loading }
}
