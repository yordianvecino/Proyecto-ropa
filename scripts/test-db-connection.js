// Pequeño script para verificar que DATABASE_URL funciona
const { PrismaClient } = require('@prisma/client')

async function main() {
  const db = new PrismaClient()
  try {
    await db.$connect()
    const [{ now }] = await db.$queryRawUnsafe('select now() as now')
    console.log('DB OK:', now)
  } catch (e) {
    console.error('DB ERROR:', e.message)
    process.exitCode = 1
  } finally {
    await db.$disconnect()
  }
}

main()
