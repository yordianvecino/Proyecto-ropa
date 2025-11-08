export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getPrisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import Link from 'next/link'

async function getProducts(): Promise<Array<{ id: string; name: string; price: number; imageUrl?: string | null; category?: string | null; slug: string }>> {
  const prisma = getPrisma()
  if (prisma) {
    try {
      const items = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 40, include: { category: true } })
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
  const supa = getSupabaseAdmin()
  if (supa) {
    const { data, error } = await supa
      .from('Product')
      .select('id,name,slug,price,imageUrl,active,createdAt,category:Category(name)')
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(40)
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

export default async function ProductsPage() {
  const products = await getProducts()
  return (
    <main className="min-h-screen py-12 container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Productos</h1>
      {products.length === 0 && (
        <p className="text-gray-600">No hay productos activos actualmente.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            <div className="h-56 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Imagen</span>
            </div>
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