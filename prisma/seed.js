// Seed básico de productos y categorías (valores de precio en centavos)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Camisetas', slug: 'camisetas' },
    { name: 'Sudaderas', slug: 'sudaderas' },
    { name: 'Accesorios', slug: 'accesorios' },
    { name: 'Vestidos', slug: 'vestidos' },
  ]

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }

  const camisetas = await prisma.category.findUnique({ where: { slug: 'camisetas' } })

  await prisma.product.upsert({
    where: { slug: 'fe-esperanza-amor' },
    update: {},
    create: {
      name: "Camiseta 'Fe, Esperanza, Amor'",
      slug: 'fe-esperanza-amor',
      description: 'Camiseta con mensaje inspirado en 1 Corintios 13:13',
      price: 2599, // 25.99 en unidades monetarias => 2599 centavos
      imageUrl: null,
      categoryId: camisetas?.id ?? null,
      active: true,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Seed completado')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
