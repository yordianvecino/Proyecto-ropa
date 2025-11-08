export const metadata = { title: 'Pago cancelado | Ropa Cristiana' }

export default function CheckoutCancelPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-lg mx-auto bg-white border rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago cancelado</h1>
        <p className="text-gray-600 mb-6">No se ha completado el pago. Puedes intentar nuevamente cuando quieras.</p>
        <a href="/carrito" className="inline-block bg-christian-purple text-white px-6 py-3 rounded-lg hover:bg-purple-700">Volver al carrito</a>
      </div>
    </main>
  )
}
