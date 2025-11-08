import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const summary: any = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    },
    prisma: {
      available: false,
      ok: false,
    },
    supabase: {
      available: false,
      ok: false,
    },
  }

  // Prisma check
  try {
    const prisma = getPrisma()
    if (prisma) {
      summary.prisma.available = true
      try {
        // Verifica conexión con una consulta trivial
        const r: any = await prisma.$queryRawUnsafe('select 1 as one')
        summary.prisma.ok = Array.isArray(r) && r.length > 0 && r[0]?.one === 1
      } catch (e: any) {
        summary.prisma.error = e?.message || String(e)
      } finally {
        try { await prisma.$disconnect() } catch {}
      }
    }
  } catch (e: any) {
    summary.prisma.error = e?.message || String(e)
  }

  // Supabase check (Service Role)
  try {
    const supa = getSupabaseAdmin()
    if (supa) {
      summary.supabase.available = true
      const { error } = await supa
        .from('Product')
        .select('id', { count: 'exact' })
        .limit(1)
      if (!error) summary.supabase.ok = true
      else summary.supabase.error = error.message
    }
  } catch (e: any) {
    summary.supabase.error = e?.message || String(e)
  }

  return NextResponse.json(summary)
}
