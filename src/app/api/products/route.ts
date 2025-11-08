import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getPrisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 12)))
    const category = searchParams.get('category') || undefined
    const skip = (page - 1) * pageSize

    const prisma = getPrisma()
    if (!prisma) {
      // Fallback cuando no hay cliente Prisma (por ejemplo, sin generar engines por proxy)
      return NextResponse.json({
        page, pageSize, total: 4,
        items: [
          { id: '1', name: "Camiseta 'Fe, Esperanza, Amor'", price: 25990, imageUrl: null, category: 'Camisetas' },
          { id: '2', name: "Sudadera 'Dios es mi fortaleza'", price: 45990, imageUrl: null, category: 'Sudaderas' },
          { id: '3', name: "Gorra 'Blessed'", price: 19990, imageUrl: null, category: 'Accesorios' },
          { id: '4', name: "Vestido 'Hija del Rey'", price: 55990, imageUrl: null, category: 'Vestidos' },
        ].slice(0, pageSize)
      })
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: { active: true, category: category ? { slug: category } : undefined },
        orderBy: { createdAt: 'desc' },
        include: { category: true },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where: { active: true, category: category ? { slug: category } : undefined } }),
    ])

    return NextResponse.json({
      page,
      pageSize,
      total,
      items: items.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category?.name ?? null,
      })),
    })
  } catch (e) {
    console.error('[GET /api/products] error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
