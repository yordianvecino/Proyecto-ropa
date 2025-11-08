import { getPrisma } from '@/lib/prisma'
import { getSupabaseRead, toPublicStorageUrl } from '@/lib/supabase'
import { unstable_noStore as noStore } from 'next/cache'
import { AddButton, WhatsAppButton } from '@/components/ProductCard'
import { formatCurrency } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ProductLike = {
  id: string
  name: string
  price: number
  imageUrl?: string | null
  category?: string | null
}

async function getFeatured(): Promise<ProductLike[]> {
  noStore()
  // 1. Supabase primero (fuente canónica)
  const supa = getSupabaseRead()
  if (process.env.NODE_ENV !== 'production') {
    console.log('[FeaturedProducts] env', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasAnon: !!process.env.SUPABASE_ANON_KEY,
      hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasClient: !!supa,
    })
  }
  if (supa) {
    try {
      // Destacados
      const res = await supa
        .from('Product')
        .select('id,name,price,imageUrl,categoryId,active,createdAt,featured,category:Category(name)')
        .eq('active', true)
        .eq('featured', true)
        .order('createdAt', { ascending: false })
        .limit(8)
      const data = res.data ?? []
      if (process.env.NODE_ENV !== 'production') {
        console.log('[FeaturedProducts] supabase-featured', { error: res.error?.message, count: data.length })
      }
      if (!res.error && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: (p.price ?? 0) / 100,
          imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
          category: p.category?.name ?? undefined,
        }))
      }
      // Fallback a recientes si no hay destacados (mejor UX)
      const res2 = await supa
        .from('Product')
        .select('id,name,price,imageUrl,categoryId,active,createdAt,featured,category:Category(name)')
        .eq('active', true)
        .order('createdAt', { ascending: false })
        .limit(8)
      if (process.env.NODE_ENV !== 'production') {
        console.log('[FeaturedProducts] supabase-recent-fallback', { error: res2.error?.message, count: res2.data?.length ?? 0 })
      }
      if (!res2.error && res2.data && res2.data.length > 0) {
        return res2.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: (p.price ?? 0) / 100,
          imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
          category: p.category?.name ?? undefined,
        }))
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[FeaturedProducts] supabase-error', e?.message || String(e))
      }
      // continuar con Prisma
    }
  }

  // 2. Prisma fallback
  const prisma = getPrisma()
  if (prisma) {
    try {
      const byFeatured = await (prisma as any).product.findMany({
        where: { active: true, featured: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      })
      if (byFeatured && byFeatured.length > 0) {
        return byFeatured.map((p: { id: string; name: string; price: number; imageUrl: string | null; category: { name: string } | null }) => ({
          id: p.id,
          name: p.name,
          price: p.price / 100,
          imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
          category: p.category?.name ?? undefined,
        }))
      }
      // Fallback Prisma a recientes si no hay destacados
      const recent = await (prisma as any).product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      })
      if (recent && recent.length > 0) {
        return recent.map((p: { id: string; name: string; price: number; imageUrl: string | null; category: { name: string } | null }) => ({
          id: p.id,
          name: p.name,
          price: p.price / 100,
          imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
          category: p.category?.name ?? undefined,
        }))
      }
    } catch {
      // sin datos
    }
  }
  return []
}

export default async function FeaturedProducts() {
  const products = await getFeatured()
  console.log('95 - Featured products count:', products.length)
  if (products.length === 0) return null
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Productos Destacados</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">Sin imagen</div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <span className="text-sm text-gray-500 font-medium">{product.category ?? ''}</span>
                <h3 className="text-lg font-semibold mt-2 mb-3 line-clamp-2">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-2xl font-bold text-brand-gold">{formatCurrency(product.price)}</span>
                  <div className="flex items-center gap-2">
                    <WhatsAppButton product={{ id: product.id, name: product.name, price: product.price, image: product.imageUrl ?? undefined, category: product.category ?? undefined }} />
                    <AddButton product={{ id: product.id, name: product.name, price: product.price, image: product.imageUrl ?? undefined, category: product.category ?? undefined }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}