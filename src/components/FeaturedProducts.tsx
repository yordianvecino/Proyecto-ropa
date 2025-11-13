import { getPrisma } from '@/lib/prisma'
import { getSupabaseRead, toPublicStorageUrl } from '@/lib/supabase'
import { getSampleFeatured } from '@/data/local-sample'
import { unstable_noStore as noStore } from 'next/cache'
import { ProductCard } from '@/components/ProductCard'
// Se usa ProductCard que ya formatea COP sin símbolo

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
          price: (p.price ?? 0),
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
          price: (p.price ?? 0),
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
          price: p.price,
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
          price: p.price,
          imageUrl: toPublicStorageUrl(p.imageUrl) ?? null,
          category: p.category?.name ?? undefined,
        }))
      }
    } catch {
      // sin datos
    }
  }
  // 3. Fallback local sample
  const local = getSampleFeatured()
  if (local.length > 0) {
    return local.map(p => ({ id: p.id, name: p.name, price: p.price, imageUrl: toPublicStorageUrl(p.imageUrl) ?? null, category: undefined }))
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
          {products.map(p => (
            <ProductCard key={p.id} product={{ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl ?? undefined, category: p.category ?? undefined }} />
          ))}
        </div>
      </div>
    </section>
  )
}