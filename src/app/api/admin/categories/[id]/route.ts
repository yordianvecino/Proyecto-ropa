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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const { data, error } = await supa.from('Category').select('*').eq('id', params.id).single()
    if (error && error.code === 'PGRST116') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(data)
  }
  const cat = await prisma.category.findUnique({ where: { id: params.id } })
  if (!cat) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(cat)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body.name !== undefined) data.name = String(body.name)
    if (body.slug !== undefined) data.slug = String(body.slug) || slugify(String(body.name || ''))
    const { data: updated, error } = await supa.from('Category').update(data).eq('id', params.id).select('*').single()
    if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 })
    return NextResponse.json(updated)
  }

  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (body.name !== undefined) data.name = String(body.name)
  if (body.slug !== undefined) data.slug = String(body.slug) || slugify(String(body.name || ''))

  try {
    const updated = await prisma.category.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const { error } = await supa.from('Category').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  try {
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 400 })
  }
}
