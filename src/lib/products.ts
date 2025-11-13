import { getPrisma } from '@/lib/prisma'
import { getSupabaseRead, toPublicStorageUrl } from '@/lib/supabase'
import { sampleProducts, sampleCategories } from '@/data/local-sample'

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

  if (prisma) {
    try {
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
        price: number // almacenado directamente en pesos
        imageUrl: string | null
        category: { name: string } | null
      }) => ({
        id: p.id,
        name: p.name,
        price: p.price, // ya está en pesos
        imageUrl: toPublicStorageUrl(p.imageUrl),
        category: p.category?.name ?? null,
      }))

      return { items, total, page, pageSize }
    } catch (e) {
      // Si Prisma falla, continuamos al fallback Supabase
    }
  }

  // Fallback Supabase: incluye filtro por categoría y orden
  const supa = getSupabaseRead()
  if (!supa) {
    // Fallback a datos locales si no hay BD
    const filtered = sampleProducts.filter(p => p.active && (!options?.categorySlug || sampleCategories.find(c => c.slug === options.categorySlug && c.id === p.categoryId)))
    const sorted = [...filtered].sort((a,b) => {
      if (options?.sort === 'price-asc') return a.price - b.price
      if (options?.sort === 'price-desc') return b.price - a.price
      return 0
    })
    const slice = sorted.slice(skip, skip + pageSize)
    return {
      items: slice.map(p => ({ id: p.id, name: p.name, price: p.price, imageUrl: toPublicStorageUrl(p.imageUrl), category: sampleCategories.find(c => c.id === p.categoryId)?.name || null })),
      total: filtered.length,
      page,
      pageSize,
    }
  }

  let categoryId: string | undefined
  if (options?.categorySlug) {
    const { data: cat } = await supa
      .from('Category')
      .select('id,slug')
      .eq('slug', options.categorySlug)
      .limit(1)
      .maybeSingle()
    categoryId = cat?.id
    if (!categoryId) return { items: [], total: 0, page, pageSize }
  }

  // Orden
  const orderColumn = options?.sort?.startsWith('price') ? 'price' : 'createdAt'
  const ascending = options?.sort === 'price-asc'

  const { data, error, count } = await supa
    .from('Product')
    .select('id,name,slug,price,imageUrl,active,createdAt,categoryId,category:Category(name)', { count: 'exact' })
    .eq('active', true)
    .match(categoryId ? { categoryId } : {})
    .order(orderColumn, { ascending: ascending ?? false })
    .range(skip, skip + pageSize - 1)

  if (error) return { items: [], total: 0, page, pageSize }

  const items: ProductListItem[] = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: (p.price ?? 0),
    imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
    category: p.category?.name ?? null,
  }))

  return { items, total: count ?? items.length, page, pageSize }
}

export async function getCategories(): Promise<CategoryItem[]> {
  const prisma = getPrisma()
  if (prisma) {
    try {
      const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
      return cats.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))
    } catch (e) {
      // Continúa a Supabase
    }
  }

  const supa = getSupabaseRead()
  if (!supa) {
    return sampleCategories.map(c => ({ slug: c.slug, name: c.name }))
  }
  const { data, error } = await supa.from('Category').select('slug,name').order('name', { ascending: true })
  if (error || !data) return []
  return data.map((c: any) => ({ slug: c.slug, name: c.name }))
}
