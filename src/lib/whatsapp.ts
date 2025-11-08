import { formatCurrency } from '@/lib/format'
import type { CartItem } from '@/types'

type WhatsAppBuildOptions = {
  currencyHint?: string
  includeImages?: boolean
  siteUrl?: string // para construir enlaces absolutos si los hubiera
}

export function buildWhatsAppMessage(items: CartItem[], opts?: WhatsAppBuildOptions) {
  const currencyHint = opts?.currencyHint
  const includeImages = opts?.includeImages ?? true

  const lines: string[] = []
  lines.push('Hola, quiero comprar estos productos:')
  lines.push('')
  let subtotal = 0
  let totalItems = 0
  for (const { product, quantity } of items) {
    const lineTotal = product.price * quantity
    subtotal += lineTotal
    totalItems += quantity
    lines.push(`• ${product.name}  x${quantity}  = ${formatCurrency(lineTotal)}`)
    if (product.category) lines.push(`  Categoría: ${product.category}`)
    lines.push(`  Ref: ${product.id}`)
    if (includeImages && product.image && /^https?:\/\//.test(product.image)) {
      lines.push(`  Imagen: ${product.image}`)
    }
    lines.push('')
  }
  lines.push(`Artículos: ${totalItems}`)
  lines.push(`Subtotal: ${formatCurrency(subtotal)}${currencyHint ? ` (${currencyHint})` : ''}`)
  lines.push('')
  lines.push('Por favor, indícame:')
  lines.push('- Talla y color de cada prenda')
  lines.push('- Ciudad y método de entrega (envío o recoger)')
  lines.push('')
  lines.push('¡Gracias! 🙏✨')
  return lines.join('\n')
}

export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const cleanPhone = phoneE164.replace(/[^0-9]/g, '')
  const base = 'https://api.whatsapp.com/send'
  const params = new URLSearchParams({ phone: cleanPhone, text: message })
  return `${base}?${params.toString()}`
}
