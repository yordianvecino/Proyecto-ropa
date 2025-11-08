export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getPrisma } from '@/lib/prisma'
import { getSupabaseRead, toPublicStorageUrl } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import Link from 'next/link'

type ProductCard = { id: string; name: string; price: number; imageUrl?: string | null; category?: string | null; slug: string }

async function getProducts(opts?: { page?: number; pageSize?: number; category?: string }): Promise<ProductCard[]> {
  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, opts?.pageSize ?? 12))
  const categorySlug = opts?.category
  const offset = (page - 1) * pageSize
  const prisma = getPrisma()
  if (prisma) {
    try {
      const where: any = { active: true }
      if (categorySlug) where.category = { slug: categorySlug }
      const items = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, include: { category: true }, skip: offset, take: pageSize })
      if (items.length > 0) {
        return items.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price / 100,
          imageUrl: p.imageUrl,
          category: p.category?.name ?? null,
        }))
      }
    } catch {/* fallback to supabase */}
  }
  const supa = getSupabaseRead()
  if (supa) {
    let categoryId: string | undefined
    if (categorySlug) {
      const { data: cat } = await supa.from('Category').select('id,slug').eq('slug', categorySlug).limit(1).maybeSingle()
      categoryId = cat?.id
      if (categorySlug && !categoryId) return []
    }
    const { data, error } = await supa
      .from('Product')
      .select('id,name,slug,price,imageUrl,active,createdAt,categoryId,category:Category(name)')
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .range(offset, offset + pageSize - 1)
      .match(categoryId ? { categoryId } : {})
    if (!error && data) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: (p.price ?? 0) / 100,
        imageUrl: p.imageUrl ?? null,
        category: p.category?.name ?? null,
      }))
    }
  }
  return []
}

export default async function ProductsPage({ searchParams }: { searchParams?: { page?: string; category?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1))
  const category = searchParams?.category
  const products = await getProducts({ page, category })
  return (
    <main className="min-h-screen py-12 container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Productos</h1>
      {products.length === 0 && (
        <p className="text-gray-600">No hay productos activos actualmente.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toPublicStorageUrl(p.imageUrl) ?? undefined} alt={p.name} className="h-56 w-full object-cover bg-gray-100" />
            ) : (
              <div className="h-56 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Imagen</span>
              </div>
            )}
            <div className="p-5">
              <span className="text-xs uppercase tracking-wide text-brand-rose">{p.category ?? ''}</span>
              <h2 className="mt-2 font-semibold text-lg mb-3 line-clamp-2">{p.name}</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-brand-gold">{formatCurrency(p.price)}</span>
                <Link href={`/producto/${p.slug}`} className="text-sm text-brand-rose hover:underline">Ver</Link>
              </div>
              <div className="flex gap-2">
                <Link href={`https://wa.me/?text=${encodeURIComponent('Hola, quiero más info sobre ' + p.name)}`} className="flex-1 text-center text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm">WhatsApp</Link>
                <button className="flex-1 text-center bg-brand-rose hover:bg-brand-pink text-white px-3 py-2 rounded text-sm">Agregar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}