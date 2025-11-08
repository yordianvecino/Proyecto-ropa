"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('No se pudo cargar la categoría')
        const c = await res.json()
        if (!mounted) return
        setName(c.name || '')
        setSlug(c.slug || '')
      } catch (e: any) {
        setError(e.message || 'Error')
      }
    })()
    return () => { mounted = false }
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || 'No se pudo actualizar')
      setLoading(false)
      return
    }
    router.push('/admin/categories')
  }

  async function onDelete() {
    if (!confirm('¿Eliminar esta categoría?')) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || 'No se pudo eliminar')
      return
    }
    router.push('/admin/categories')
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Editar categoría</h1>
      <form onSubmit={onSubmit} className="max-w-xl bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Slug</label>
          <input className="w-full border rounded px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button disabled={loading} type="submit" className="bg-brand-rose text-white px-4 py-2 rounded-lg hover:bg-brand-pink disabled:opacity-60">Guardar</button>
          <button type="button" onClick={() => router.push('/admin/categories')} className="border px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={onDelete} className="ml-auto text-red-600 hover:underline">Eliminar</button>
        </div>
      </form>
    </main>
  )
}
