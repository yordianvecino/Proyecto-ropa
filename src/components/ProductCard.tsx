"use client"

import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useWhatsAppPhone } from '@/hooks/useWhatsAppPhone'

export function AddButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  return (
    <button onClick={() => addToCart(product)} className="bg-brand-rose hover:bg-brand-pink text-white px-4 py-2 rounded-lg transition-colors">
      Agregar
    </button>
  )
}

export function WhatsAppButton({ product, quantity = 1 }: { product: Product, quantity?: number }) {
  const { phone, loading } = useWhatsAppPhone()
  const disabled = !phone || loading
  const handleClick = () => {
    if (!phone) return
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const msg = buildWhatsAppMessage([{ product: { ...product }, quantity }], { includeImages: true, includeLinks: true, siteUrl: origin })
    const url = buildWhatsAppUrl(phone, msg)
    window.open(url, '_blank')
  }
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? 'Configura WHATSAPP_PHONE en .env o espera carga' : 'Comprar por WhatsApp'}
      className={`border border-green-600 text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Cargando…' : 'WhatsApp'}
    </button>
  )
}

