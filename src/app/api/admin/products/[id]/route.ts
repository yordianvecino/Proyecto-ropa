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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma()
  if (!prisma) {
    const supa = getSupabaseAdmin()
    if (!supa) return NextResponse.json({ error: 'BD no configurada' }, { status: 501 })
    const { data, error } = await supa.from('Product').select('*').eq('id', params.id).single()
    if (error && error.code === 'PGRST116') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(data)
  }
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(product)
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
    if (body.slug !== undefined) data.slug = String(body.slug)
    if (body.description !== undefined) data.description = body.description ? String(body.description) : null
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null
    if (body.categoryId !== undefined) data.categoryId = body.categoryId ? String(body.categoryId) : null
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
      data.price = Math.floor(price)
    }
    if (body.active !== undefined) data.active = !!body.active
    const { data: updated, error } = await supa.from('Product').update(data).eq('id', params.id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(updated)
  }

  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (body.name !== undefined) data.name = String(body.name)
  if (body.slug !== undefined) data.slug = String(body.slug)
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null
  if (body.categoryId !== undefined) data.categoryId = body.categoryId ? String(body.categoryId) : null
  if (body.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    data.price = Math.floor(price)
  }
  if (body.active !== undefined) data.active = !!body.active

  try {
    const updated = await prisma.product.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (e) {
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
    const { error } = await supa.from('Product').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 400 })
    return NextResponse.json({ ok: true })
  }
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 400 })
  }
}
