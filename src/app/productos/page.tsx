import Link from 'next/link'
import { AddButton, WhatsAppButton } from '@/components/ProductCard'
import { formatCurrency } from '@/lib/format'
import { getProducts, getCategories } from '@/lib/products'

export const metadata = {
  title: 'Productos | Ropa Cristiana',
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  })
  return `?${usp.toString()}`
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page) || 1
  const category = (Array.isArray(searchParams?.category) ? searchParams?.category[0] : searchParams?.category) || undefined
  const sort = (Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : searchParams?.sort) as 'newest' | 'price-asc' | 'price-desc' | undefined
  const pageSize = 12

  const [{ items, total }, categories] = await Promise.all([
    getProducts({ page, pageSize, categorySlug: category, sort }),
    getCategories(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentCategory = categories.find((c) => c.slug === category)

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Categorías</h2>
          <ul className="space-y-2">
            <li>
              <Link
                className={`block px-3 py-2 rounded hover:bg-gray-100 ${!category ? 'font-semibold text-brand-rose' : 'text-gray-700'}`}
                href={buildQuery({ page: 1 })}
              >
                Todas
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  className={`block px-3 py-2 rounded hover:bg-gray-100 ${category === cat.slug ? 'font-semibold text-brand-rose' : 'text-gray-700'}`}
                  href={buildQuery({ page: 1, category: cat.slug })}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{currentCategory?.name ?? 'Productos'}</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-600">{total} resultado{total !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Ordenar:</span>
                <Link className={`px-2 py-1 rounded ${!sort || sort === 'newest' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`} href={buildQuery({ page: 1, category, sort: 'newest' })}>Recientes</Link>
                <Link className={`px-2 py-1 rounded ${sort === 'price-asc' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`} href={buildQuery({ page: 1, category, sort: 'price-asc' })}>Precio ↑</Link>
                <Link className={`px-2 py-1 rounded ${sort === 'price-desc' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`} href={buildQuery({ page: 1, category, sort: 'price-desc' })}>Precio ↓</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <div key={product.id} className="rounded-lg border bg-white overflow-hidden">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Imagen</span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-brand-rose">{product.category ?? ''}</span>
                  <h3 className="mt-1 font-semibold text-gray-900">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-brand-gold">{formatCurrency(product.price)}</span>
                    <div className="flex items-center gap-2">
                      <WhatsAppButton product={{ id: product.id, name: product.name, price: product.price, image: product.imageUrl ?? undefined, category: product.category ?? undefined }} />
                      <AddButton product={{ id: product.id, name: product.name, price: product.price, image: product.imageUrl ?? undefined, category: product.category ?? undefined }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="mt-8 flex flex-col items-center gap-3" aria-label="Paginación">
            <Link
              className={`px-4 py-2 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
              href={buildQuery({ page: Math.max(1, page - 1), category, sort })}
            >
              Anterior
            </Link>
            <ul className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(totalPages - 4, page - 2))
                const p = start + i
                return (
                  <li key={p}>
                    <Link
                      href={buildQuery({ page: p, category, sort })}
                      className={`px-3 py-1 rounded border ${p === page ? 'bg-brand-rose text-white border-brand-rose' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link
              className={`px-4 py-2 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
              href={buildQuery({ page: Math.min(totalPages, page + 1), category, sort })}
            >
              Siguiente
            </Link>
          </nav>
        </section>
      </div>
    </main>
  )
}
