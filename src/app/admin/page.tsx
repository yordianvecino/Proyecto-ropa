export const metadata = {
  title: 'Admin | Ropa Cristiana',
}

export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Panel de Administración</h1>
      <div className="rounded-lg border p-8 bg-white">
        <p className="text-gray-700">Esta sección estará protegida con autenticación y rol de administrador. Próximamente: gestión de productos, pedidos y usuarios.</p>
      </div>
    </main>
  )
}
