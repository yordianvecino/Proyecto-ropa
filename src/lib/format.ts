export function formatCurrency(value: number, currency = 'COP', locale: string = 'es-CO') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value)
  } catch {
    return `$${value.toFixed(0)}`
  }
}

// Formato específico para pesos colombianos sin símbolo, solo miles: 20.000
export function formatCOP(value: number, locale: string = 'es-CO') {
  try {
    return new Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(value))
  } catch {
    return String(Math.round(value))
  }
}

// Helper para valores en centavos: convierte a unidades y formatea sin símbolo
export function formatCentsCOP(cents: number) {
  return formatCOP(cents / 100)
}

// Helper para centavos mostrando símbolo $ (pesos colombianos)
export function formatCentsCurrency(cents: number) {
  return formatCurrency(cents / 100)
}
 
