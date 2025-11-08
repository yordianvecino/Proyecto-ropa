import { formatCurrency } from '@/lib/format'
import type { CartItem } from '@/types'

export function buildWhatsAppMessage(items: CartItem[], currencyHint?: string) {
  const lines: string[] = []
  lines.push('Hola, quiero comprar estos productos:')
  lines.push('')
  let subtotal = 0
  for (const { product, quantity } of items) {
    const lineTotal = product.price * quantity
    subtotal += lineTotal
    lines.push(`- ${product.name} (x${quantity}) = ${formatCurrency(lineTotal)}`)
  }
  lines.push('')
  lines.push(`Subtotal: ${formatCurrency(subtotal)}${currencyHint ? ` (${currencyHint})` : ''}`)
  lines.push('')
  lines.push('¿Me confirmas disponibilidad y forma de entrega?')
  return lines.join('\n')
}

export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const cleanPhone = phoneE164.replace(/[^0-9]/g, '')
  const base = 'https://api.whatsapp.com/send'
  const params = new URLSearchParams({ phone: cleanPhone, text: message })
  return `${base}?${params.toString()}`
}
