import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD // texto plano opcional
        if (!credentials?.email || !adminEmail) return null
        const inputEmail = credentials.email.trim().toLowerCase()
        const envEmail = adminEmail.trim().toLowerCase()
        const emailOk = inputEmail === envEmail
        // Si ADMIN_PASSWORD está definido, exigir coincidencia exacta; si no, permitir solo por email.
        const passOk = adminPassword ? credentials.password === adminPassword : true
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth] emailOk:', emailOk, 'passCheck:', adminPassword ? passOk : 'skipped (no ADMIN_PASSWORD)')
        }
        if (!(emailOk && passOk)) return null
        return { id: 'admin', name: 'Administrador', email: adminEmail, role: 'ADMIN' as const }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role ?? 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).role = (token as any).role ?? 'CUSTOMER'
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
