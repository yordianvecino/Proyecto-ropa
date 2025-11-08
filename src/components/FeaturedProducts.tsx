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
      // Intentar primero destacados
      const byFeatured = await (prisma as any).product.findMany({
        where: { active: true, featured: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      })
      const base = (byFeatured?.length ?? 0) > 0 ? byFeatured : await (prisma as any).product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: true },
      })
      if (base && base.length > 0) {
        return base.map((p: { id: string; name: string; price: number; imageUrl: string | null; category: { name: string } | null }) => ({
          id: p.id,
          // Priorizar Supabase (fuente canónica) y si falla o vacío, Prisma
          const supa = getSupabaseAdmin()
          if (supa) {
            try {
              // Destacados primero
              const res = await supa
                .from('Product')
                .select('id,name,price,imageUrl,categoryId,active,createdAt,category:Category(name)')
                .eq('active', true)
                .eq('featured', true)
                .order('createdAt', { ascending: false })
                .limit(8)
              const data = res.data ?? []
              if (!res.error && data.length > 0) {
                return data.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  price: (p.price ?? 0) / 100,
                  imageUrl: p.imageUrl ?? undefined,
                  category: p.category?.name ?? undefined,
                }))
              }
              // Si no hay destacados, traer recientes
              const res2 = await supa
                .from('Product')
                .select('id,name,price,imageUrl,categoryId,active,createdAt,category:Category(name)')
                .eq('active', true)
                .order('createdAt', { ascending: false })
                .limit(8)
              if (!res2.error && res2.data) {
                return res2.data.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  price: (p.price ?? 0) / 100,
                  imageUrl: p.imageUrl ?? undefined,
                  category: p.category?.name ?? undefined,
                }))
              }
            } catch {
              // fall back a prisma
            }
          }

          const prisma = getPrisma()
          if (prisma) {
            try {
              const byFeatured = await (prisma as any).product.findMany({
                where: { active: true, featured: true },
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: { category: true },
              })
              const base = (byFeatured?.length ?? 0) > 0 ? byFeatured : await (prisma as any).product.findMany({
                where: { active: true },
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: { category: true },
              })
              if (base && base.length > 0) {
                return base.map((p: { id: string; name: string; price: number; imageUrl: string | null; category: { name: string } | null }) => ({
                  id: p.id,
                  name: p.name,
                  price: p.price / 100,
                  imageUrl: p.imageUrl ?? undefined,
                  category: p.category?.name ?? undefined,
                }))
              }
            } catch (e) {
              // ninguna fuente disponible
            }
          }
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