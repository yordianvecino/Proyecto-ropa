import { getPrisma } from '@/lib/prisma'

export type ProductListItem = {
  id: string
  name: string
  // Precio en unidades monetarias (no centavos) para la UI
  price: number
  imageUrl?: string | null
  category?: string | null
}

export type CategoryItem = { slug: string; name: string }

type GetProductsOptions = {
  page?: number
  pageSize?: number
  categorySlug?: string
  sort?: 'newest' | 'price-asc' | 'price-desc'
}

export async function getProducts(options?: GetProductsOptions): Promise<{
  items: ProductListItem[]
  total: number
  page: number
  pageSize: number
}> {
  const page = Math.max(1, options?.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 12))
  const skip = (page - 1) * pageSize
  const prisma = getPrisma()

  if (!prisma) {
    // Fallback estático cuando Prisma no está disponible
    let mock: ProductListItem[] = [
      { id: '1', name: "Camiseta 'Fe, Esperanza, Amor'", price: 25.99, imageUrl: null, category: 'Camisetas' },
      { id: '2', name: "Sudadera 'Dios es mi fortaleza'", price: 45.99, imageUrl: null, category: 'Sudaderas' },
      { id: '3', name: "Gorra 'Blessed'", price: 19.99, imageUrl: null, category: 'Accesorios' },
      { id: '4', name: "Vestido 'Hija del Rey'", price: 55.99, imageUrl: null, category: 'Vestidos' },
    ]
    if (options?.categorySlug) {
      mock = mock.filter((m) => m.category?.toLowerCase() === options.categorySlug)
    }
    if (options?.sort === 'price-asc') mock = mock.sort((a, b) => a.price - b.price)
    if (options?.sort === 'price-desc') mock = mock.sort((a, b) => b.price - a.price)
    return { items: mock.slice(skip, skip + pageSize), total: mock.length, page, pageSize }
  }

  const where = {
    active: true,
    category: options?.categorySlug ? { slug: options.categorySlug } : undefined,
  }
  const orderBy =
    options?.sort === 'price-asc'
      ? { price: 'asc' as const }
      : options?.sort === 'price-desc'
      ? { price: 'desc' as const }
      : { createdAt: 'desc' as const }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  const items: ProductListItem[] = rows.map((p: {
    id: string
    name: string
    price: number // almacenado en centavos
    imageUrl: string | null
    category: { name: string } | null
  }) => ({
    id: p.id,
    name: p.name,
    price: p.price / 100, // convertir de centavos a unidades
    imageUrl: p.imageUrl,
    category: p.category?.name ?? null,
  }))

  return { items, total, page, pageSize }
}

export async function getCategories(): Promise<CategoryItem[]> {
  const prisma = getPrisma()
  if (!prisma) {
    // Fallback estático
    return [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'sudaderas', name: 'Sudaderas' },
      { slug: 'accesorios', name: 'Accesorios' },
      { slug: 'vestidos', name: 'Vestidos' },
    ]
  }
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return cats.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))
}
