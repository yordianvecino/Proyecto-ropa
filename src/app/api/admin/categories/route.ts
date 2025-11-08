import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'

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
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === '1'
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize = Math.min(200, Math.max(1, Number(searchParams.get('pageSize') ?? 50)))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const base = supa.from('Category').select('*', { count: 'exact' }).order('name', { ascending: true })
    const query = all ? base : base.range(from, to)
    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (all) return NextResponse.json({ items: data || [], total: data?.length || 0, page: 1, pageSize: data?.length || 0 })
    return NextResponse.json({ items: data || [], total: count || 0, page, pageSize })
  }

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get('pageSize') ?? 50)))
  const skip = (page - 1) * pageSize

  if (all) {
    const items = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ items, total: items.length, page: 1, pageSize: items.length })
  }

  const [items, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' }, skip, take: pageSize }),
    prisma.category.count(),
  ])
  return NextResponse.json({ items, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    const slug = body?.slug ? String(body.slug) : slugify(name)
    const { data, error } = await supa.from('Category').insert([{ name, slug }]).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  }

  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  const slug = body?.slug ? String(body.slug) : slugify(name)
  try {
    const created = await prisma.category.create({ data: { name, slug } })
    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear (¿nombre/slug duplicado?)' }, { status: 400 })
  }
}
