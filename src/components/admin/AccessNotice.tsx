"use client"
import { useSession } from 'next-auth/react'

export default function AccessNotice() {
  const { data, status } = useSession()
  const isAdmin = (data?.user as any)?.role === 'ADMIN'
  if (status === 'loading' || isAdmin) return null
  return (
    <div className="mt-8 rounded-lg border p-6 bg-white">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso</h3>
      <p className="text-sm text-gray-600">
        Esta sección está protegida. Inicia sesión con tu correo y contraseña de administrador.
        Si no puedes ver los listados, revisa que la sesión esté activa.
      </p>
    </div>
  )
}
