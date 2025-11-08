import { NextResponse } from 'next/server'
import { getSupabaseRead } from '@/lib/supabase'
import { getPrisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const out: any = { env: { hasUrl: !!process.env.SUPABASE_URL, hasAnon: !!process.env.SUPABASE_ANON_KEY, hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY } }

  const supa = getSupabaseRead()
  if (supa) {
    const q1 = await supa
      .from('Product')
      .select('id,name,featured,active,createdAt')
      .eq('active', true)
      .eq('featured', true)
      .order('createdAt', { ascending: false })
      .limit(8)
    out.supabase_featured = { error: q1.error?.message ?? null, count: q1.data?.length ?? 0 }

    const q2 = await supa
      .from('Product')
      .select('id,name,featured,active,createdAt')
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(8)
    out.supabase_recent = { error: q2.error?.message ?? null, count: q2.data?.length ?? 0 }
  } else {
    out.supabase = 'no-client'
  }

  const prisma = getPrisma()
  if (prisma) {
    try {
      const pf = await (prisma as any).product.count({ where: { active: true, featured: true } })
      const pr = await (prisma as any).product.count({ where: { active: true } })
      out.prisma = { featured: pf, recent: pr }
    } catch (e: any) {
      out.prisma = { error: e?.message || String(e) }
    }
  } else {
    out.prisma = 'no-client'
  }

  return NextResponse.json(out)
}
