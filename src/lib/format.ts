export function formatCurrency(value: number, currency = 'COP', locale: string = 'es-CO') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value)
  } catch {
    return `$${value.toFixed(0)}`
  }
}
 
