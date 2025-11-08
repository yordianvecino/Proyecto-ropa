"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'

type Item = { id: string; name: string; slug: string; price: number; imageUrl?: string | null; category?: string | null }

export default function ProductsPreview({ pageSize = 8 }: { pageSize?: number }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/products?page=1&pageSize=${pageSize}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Error al cargar productos')
        const json = await res.json()
        setItems((json?.items || []) as Item[])
      } catch (e: any) {
        setError(e?.message || 'No se pudieron cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [pageSize])

  return (
    <section className="rounded-lg border p-6 bg-white mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Vista rápida del catálogo</h2>
        <Link href="/products" className="text-sm text-brand-rose hover:underline">Ver todo</Link>
      </div>
      {loading && <p className="text-sm text-gray-600">Cargando productos...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <div key={p.id} className="border rounded-lg p-4">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="h-28 w-full object-cover rounded mb-3 bg-gray-100" />
              ) : (
                <div className="h-28 bg-gray-100 rounded mb-3 flex items-center justify-center text-xs text-gray-500">Imagen</div>
              )}
              <div className="text-sm font-medium line-clamp-2">{p.name}</div>
              <div className="text-xs text-gray-600 mb-2">{p.category || ''}</div>
              <div className="text-brand-gold font-bold">{formatCurrency((p.price || 0) / 100)}</div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-600">No hay productos activos.</p>
          )}
        </div>
      )}
    </section>
  )
}