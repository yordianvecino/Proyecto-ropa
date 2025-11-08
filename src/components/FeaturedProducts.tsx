import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'
import { AddButton, WhatsAppButton } from '@/components/ProductCard'
import { formatCurrency } from '@/lib/format'

type ProductLike = {
  id: string
  name: string
  price: number
  imageUrl?: string | null
  category?: string | null
}

async function getFeatured(): Promise<ProductLike[]> {
  const prisma = getPrisma()
  if (prisma) {
    try {
      const products = await prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      })
      if (products.length > 0) {
        return products.map((p: { id: string; name: string; price: number; imageUrl: string | null; category: { name: string } | null }) => ({
          id: p.id,
          name: p.name,
          price: p.price / 100,
          imageUrl: p.imageUrl,
          category: p.category?.name ?? null,
        }))
      }
    } catch {/* ignorar y usar fallback supabase */}
  }
  // Fallback Supabase si Prisma no disponible
  const supa = getSupabaseAdmin()
  if (supa) {
    const { data, error } = await supa
      .from('Product')
      .select('id,name,price,imageUrl,categoryId,active,createdAt,category:Category(name)')
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(8)
    if (!error && data) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: (p.price ?? 0) / 100,
        imageUrl: p.imageUrl ?? null,
        category: p.category?.name ?? null,
      }))
    }
  }
  return []
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeaturedProducts() {
  const products = await getFeatured()
  return (
  <section className="py-16 bg-brand-blush">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Productos Destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Imagen del producto</span>
              </div>
              <div className="p-6">
                <span className="text-sm text-brand-rose font-medium">{product.category ?? ''}</span>
                <h3 className="text-lg font-semibold mt-2 mb-3">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
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