import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { cookies } from 'next/headers'

async function fetchAdminProducts() {
  try {
    const res = await fetch(`/api/admin/products`, {
      cache: 'no-store',
      // Adelantar cookies para que NextAuth autorice (SSR)
      headers: { cookie: cookies().toString() },
    })
    if (!res.ok) throw new Error('Failed')
    return res.json()
  } catch {
    return { error: 'BD no configurada o sin acceso', items: [], total: 0 }
  }
}

export default async function AdminProductsPage() {
  const data = await fetchAdminProducts()
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Productos (Admin)</h1>
        <Link href="/admin/products/new" className="bg-christian-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700">Nuevo producto</Link>
      </div>
      {data?.error && (
        <p className="text-sm text-red-600 mb-4">{data.error}</p>
      )}
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{p.categoryNombre || '–'}</td>
                <td className="px-4 py-2">{formatCurrency(p.price / 100)}</td>
                <td className="px-4 py-2">{p.active ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2">
                  <Link className="text-christian-purple hover:underline" href={`/admin/products/${p.id}`}>Editar</Link>
                </td>
              </tr>
            ))}
            {(!data.items || data.items.length === 0) && (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={5}>No hay productos para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
