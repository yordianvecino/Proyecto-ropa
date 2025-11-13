"use client"

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'

type Category = { id: string; name: string; slug: string }
type ApiResponse = { items: Category[]; total: number; error?: string }

export default function AdminCategoriesPage() {
  const [data, setData] = useState<ApiResponse>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/categories', { credentials: 'include', cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        setError('Sesión expirada o no autenticado. Inicia sesión para ver las categorías.')
        setData({ items: [], total: 0 })
        return
      }
      if (!res.ok) throw new Error('Error en la carga')
      const json = (await res.json()) as ApiResponse
      setData(json)
    } catch (e) {
      setError('BD no configurada o sin acceso')
      setData({ items: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categorías (Admin)</h1>
        <div className="flex items-center gap-3">
          <button onClick={load} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Refrescar</button>
          <Link href="/admin/categories/new" className="bg-brand-rose text-white px-4 py-2 rounded-lg hover:bg-brand-pink">Nueva categoría</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-600 mb-4">Cargando categorías...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Acciones</th>
              <th className="px-4 py-2">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.slug}</td>
                <td className="px-4 py-2">
                  <Link className="text-brand-rose hover:underline" href={`/admin/categories/${c.id}`}>Editar</Link>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={async () => {
                      if (!confirm('¿Eliminar categoría? Los productos asociados quedarán sin categoría.')) return
                      try {
                        const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE', credentials: 'include' })
                        if (!res.ok) alert('No se pudo eliminar')
                        await load()
                      } catch {
                        alert('Error al eliminar')
                      }
                    }}
                    className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                  >Eliminar</button>
                </td>
              </tr>
            ))}
            {(!data.items || data.items.length === 0) && !loading && (
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
