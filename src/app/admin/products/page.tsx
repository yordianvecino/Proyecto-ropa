"use client"

import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { useState, useEffect, useCallback } from 'react'

type Product = {
  id: string
  name: string
  price: number
  active: boolean
  categoryNombre?: string | null
  imageUrl?: string | null
  featured?: boolean
}

type ApiResponse = { items: Product[]; total: number; error?: string }

export default function AdminProductsPage() {
  const [data, setData] = useState<ApiResponse>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [q, setQ] = useState<string>('')
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (q) params.set('q', q)
      if (onlyFeatured) params.set('featured', '1')
      const res = await fetch(`/api/admin/products?${params.toString()}` , { credentials: 'include', cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        setError('Sesión expirada o no autenticado. Inicia sesión para ver los productos.')
        setData({ items: [], total: 0 })
        return
      }
      if (!res.ok) throw new Error('Fail')
      const json = (await res.json()) as ApiResponse
      setData(json)
    } catch {
      setError('BD no configurada o sin acceso')
      setData({ items: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, q, onlyFeatured])

  useEffect(() => { void load() }, [load])

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Productos (Admin)</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); void load() } }}
              placeholder="Buscar por nombre..."
              className="border rounded-lg px-3 py-2 text-sm pr-8 w-60"
            />
            {q && (
              <button onClick={() => { setQ(''); setPage(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">×</button>
            )}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={onlyFeatured} onChange={(e) => { setOnlyFeatured(e.target.checked); setPage(1) }} />
            Solo destacados
          </label>
          <button onClick={load} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Refrescar</button>
          <Link href="/products" className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Ver tienda</Link>
          <Link href="/admin/products/new" className="bg-brand-rose text-white px-4 py-2 rounded-lg hover:bg-brand-pink">Nuevo producto</Link>
        </div>
      </div>
      {loading && <p className="text-sm text-gray-600 mb-4">Cargando productos...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Destacado</th>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Acciones</th>
              <th className="px-4 py-2">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{p.categoryNombre || '–'}</td>
                <td className="px-4 py-2">{formatCurrency(p.price)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={async () => {
                      const next = !p.featured
                      try {
                        await fetch(`/api/admin/products/${p.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ featured: next }),
                        })
                        await load()
                      } catch {}
                    }}
                    className={`text-xs px-2 py-1 rounded border ${p.featured ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-300 text-gray-700'}`}
                    title={p.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    {p.featured ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-2">{p.active ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2">
                  <Link className="text-brand-rose hover:underline" href={`/admin/products/${p.id}`}>Editar</Link>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={async () => {
                      if (!confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) return
                      try {
                        const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE', credentials: 'include' })
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
                <td className="px-4 py-4 text-gray-600" colSpan={6}>No hay productos para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
        <div>
          {data.total > 0 && (
            <span>
              Mostrando {Math.min((page - 1) * pageSize + 1, data.total)}–{Math.min(page * pageSize, data.total)} de {data.total}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >Anterior</button>
          <button
            className="border rounded px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => (p * pageSize < (data.total || 0) ? p + 1 : p))}
            disabled={page * pageSize >= (data.total || 0) || loading}
          >Siguiente</button>
        </div>
      </div>
    </main>
  )
}
