"use client"

import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'

export function AddButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  return (
    <button onClick={() => addToCart(product)} className="bg-brand-rose hover:bg-brand-pink text-white px-4 py-2 rounded-lg transition-colors">
      Agregar
    </button>
  )
}

export function WhatsAppButton({ product, quantity = 1 }: { product: Product, quantity?: number }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ''
  const disabled = !phone
  const handleClick = () => {
    if (!phone) return
    const msg = buildWhatsAppMessage([{ product, quantity }])
    const url = buildWhatsAppUrl(phone, msg)
    window.open(url, '_blank')
  }
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? 'Configura NEXT_PUBLIC_WHATSAPP_PHONE en .env' : 'Comprar por WhatsApp'}
      className={`border border-green-600 text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      WhatsApp
    </button>
  )
}

