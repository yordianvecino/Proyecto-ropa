"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    })
    setLoading(false)
    if (!res) return
    if (res.error) {
      setError('Credenciales inválidas')
      return
    }
    // Evitar redirigir a la callback URL interna de credentials (GET no soportado)
    router.push(callbackUrl)
  }

  return (
    <main className="min-h-[60vh] container mx-auto px-4 py-10 flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg border space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Acceder</h1>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-christian-purple hover:bg-purple-700 text-white rounded px-4 py-2 disabled:opacity-60">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
