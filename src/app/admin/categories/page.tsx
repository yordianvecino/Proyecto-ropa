import Link from 'next/link'
import { cookies } from 'next/headers'

async function fetchAdminCategories() {
  try {
    const res = await fetch(`/api/admin/categories`, {
      cache: 'no-store',
      headers: { cookie: cookies().toString() },
    })
    if (!res.ok) throw new Error('Failed')
    return res.json()
  } catch {
    return { error: 'BD no configurada o sin acceso', items: [], total: 0 }
  }
}

export default async function AdminCategoriesPage() {
  const data = await fetchAdminCategories()
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categorías (Admin)</h1>
  <Link href="/admin/categories/new" className="bg-brand-rose text-white px-4 py-2 rounded-lg hover:bg-brand-pink">Nueva categoría</Link>
      </div>
      {data?.error && (
        <p className="text-sm text-red-600 mb-4">{data.error}</p>
      )}
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.slug}</td>
                <td className="px-4 py-2">
                  <Link className="text-brand-rose hover:underline" href={`/admin/categories/${c.id}`}>Editar</Link>
                </td>
              </tr>
            ))}
            {(!data.items || data.items.length === 0) && (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={3}>No hay categorías para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
