import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getToken } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  // Priorizar Supabase como fuente canónica si está configurado
  const supa = getSupabaseAdmin()
  if (supa) {

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))
    const q = (searchParams.get('q') ?? '').trim()
    const featured = searchParams.get('featured') === '1'
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supa
      .from('Product')
      .select('id,name,slug,price,description,imageUrl,active,featured,categoryId,createdAt,updatedAt,category:Category(name)', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }
    if (featured) {
      query = query.eq('featured', true)
    }

    const { data, count, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const items = (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      active: p.active,
      categoryId: p.categoryId,
      featured: !!p.featured,
      categoryNombre: p.category?.name ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))
    return NextResponse.json({ items, total: count ?? 0, page, pageSize })
  }
  // Si no hay Supabase, usar Prisma
  const prisma = getPrisma()
  if (!prisma) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))
  const q = (searchParams.get('q') ?? '').trim()
  const featured = searchParams.get('featured') === '1'
  const skip = (page - 1) * pageSize

  const where: any = q ? { name: { contains: q, mode: 'insensitive' as const } } : {}
  if (featured) where.featured = true

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, include: { category: true }, skip, take: pageSize }),
    prisma.product.count({ where }),
  ])
  // Normalizar salida (price en pesos, incluir categoriaNombre para conveniencia)
  return NextResponse.json({
    items: items.map((p: {
      id: string
      name: string
      slug: string
      price: number
      description: string | null
      imageUrl: string | null
      active: boolean
      categoryId: string | null
      createdAt: Date
      updatedAt: Date
      category?: { name: string } | null
    }) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price, // centavos
      description: p.description,
      imageUrl: p.imageUrl,
      active: p.active,
      featured: (p as any).featured ?? false,
      categoryId: p.categoryId,
      categoryNombre: p.category?.name || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    total,
    page,
    pageSize,
  })
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  // Priorizar Supabase para escritura si está disponible
  const supa = getSupabaseAdmin()
  if (supa) {

    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const price = Number(body?.price)
    const description = body?.description ? String(body.description) : null
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null
    const categoryId = body?.categoryId ? String(body.categoryId) : null
    const featured = !!body?.featured
    if (!name || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Nombre y precio (en pesos) son obligatorios' }, { status: 400 })
    }
    const slug = body?.slug ? String(body.slug) : slugify(name)
    const { data, error } = await supa
      .from('Product')
      .insert([{ name, slug, price: Math.floor(price), description, imageUrl, active: true, featured, categoryId }])
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  }
  // Si no hay Supabase, usar Prisma
  const prisma = getPrisma()
  if (!prisma) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  const price = Number(body?.price)
  const description = body?.description ? String(body.description) : undefined
  const imageUrl = body?.imageUrl ? String(body.imageUrl) : undefined
  const categoryId = body?.categoryId ? String(body.categoryId) : undefined
  const featured = !!body?.featured
  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'Nombre y precio (en pesos) son obligatorios' }, { status: 400 })
  }
  const slug = body?.slug ? String(body.slug) : slugify(name)
  try {
    const created = await prisma.product.create({
      data: { name, slug, price: Math.floor(price), description, imageUrl, active: true, featured, categoryId },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo crear el producto (¿slug duplicado?)' }, { status: 400 })
  }
}
