import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// API pública de productos activos con soporte de paginación y filtro por categoría
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 12)))
  const categorySlug = searchParams.get('category') || undefined
  const offset = (page - 1) * pageSize

  const prisma = getPrisma()
  if (prisma) {
    const where: any = { active: true }
    if (categorySlug) where.category = { slug: categorySlug }
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
        skip: offset,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])
    return NextResponse.json({
      page,
      pageSize,
      total,
      items: items.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category?.name ?? null,
      })),
    })
  }

  const supa = getSupabaseAdmin()
  if (!supa) {
    return NextResponse.json({ page, pageSize, total: 0, items: [] })
  }

  // Supabase fallback (sin joins complejos: relación Category por FK y nombre mediante RPC select alias)
  let query = supa
    .from('Product')
    .select('id,name,slug,price,imageUrl,active,createdAt,category:Category(name)')
    .eq('active', true)
    .order('createdAt', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (categorySlug) {
    // Filtrado por categoría requiere primero resolver id de categoría si solo tenemos slug; asumimos slug==name simplificado o slug almacenado en Product.
    query = query.eq('categorySlug', categorySlug)
  }
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    page,
    pageSize,
    total: count ?? (data?.length || 0),
    items: (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category?.name ?? null,
    })),
  })
}

export function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
