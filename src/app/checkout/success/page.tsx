export const metadata = { title: 'Pago completado | Ropa Cristiana' }

export default function CheckoutSuccessPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-lg mx-auto bg-white border rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu compra!</h1>
        <p className="text-gray-600 mb-6">Hemos recibido tu pago. Te enviaremos la confirmación por email.</p>
        <a href="/" className="inline-block bg-christian-purple text-white px-6 py-3 rounded-lg hover:bg-purple-700">Volver al inicio</a>
      </div>
    </main>
  )
}
