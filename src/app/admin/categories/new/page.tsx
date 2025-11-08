"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || 'No se pudo crear la categoría')
      setLoading(false)
      return
    }
    router.push('/admin/categories')
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Nueva categoría</h1>
      <form onSubmit={onSubmit} className="max-w-xl bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button disabled={loading} type="submit" className="bg-brand-rose text-white px-4 py-2 rounded-lg hover:bg-brand-pink disabled:opacity-60">Guardar</button>
          <button type="button" onClick={() => router.push('/admin/categories')} className="border px-4 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </main>
  )
}
