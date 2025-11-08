"use client"

import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/format'
import { useState } from 'react'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useWhatsAppPhone } from '@/hooks/useWhatsAppPhone'

export default function CarritoPage() {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)

  const { phone, loading } = useWhatsAppPhone()

  function sendWhatsApp() {
    setError(null)
    if (!phone) {
      setError('Configura WHATSAPP_PHONE en .env para habilitar WhatsApp')
      return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const msg = buildWhatsAppMessage(items, { includeImages: false, includeLinks: true, siteUrl: origin })
    const url = buildWhatsAppUrl(phone, msg)
    window.open(url, '_blank')
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Tu Carrito</h1>

      {items.length === 0 ? (
        <div className="rounded-lg border p-8 bg-white text-center">
          <p className="text-gray-700 mb-4">Tu carrito está vacío por ahora.</p>
          <a href="/productos" className="inline-block bg-brand-rose text-white px-6 py-3 rounded-lg hover:bg-brand-pink transition-colors">Explorar productos</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="rounded-lg border bg-white p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Disminuir" className="px-2 py-1 border rounded" onClick={() => updateQuantity(product.id, quantity - 1)}>-</button>
                  <input aria-label="Cantidad" className="w-14 text-center border rounded py-1" type="number" min={1} value={quantity} onChange={(e) => updateQuantity(product.id, Number(e.target.value))} />
                  <button aria-label="Aumentar" className="px-2 py-1 border rounded" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                </div>
                <div className="w-32 text-right font-semibold">{formatCurrency(product.price * quantity)}</div>
                <button className="text-red-600 hover:underline" onClick={() => removeFromCart(product.id)}>Eliminar</button>
              </div>
            ))}
          </div>
          <aside className="rounded-lg border bg-white p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Resumen</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Artículos</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-base font-semibold mb-4">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <button onClick={clearCart} className="w-full border rounded-lg py-2 mb-2 hover:bg-gray-50">Vaciar</button>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button onClick={sendWhatsApp} disabled={!phone || loading} className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Cargando número…' : 'Enviar pedido por WhatsApp'}
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}
