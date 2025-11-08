// Carga diferida para evitar fallo de build cuando no existe @prisma/client generado
// y permitir fallback a datos estáticos.
let PrismaClient: any
try {
	PrismaClient = require('@prisma/client').PrismaClient
} catch {
	PrismaClient = null
}

const globalForPrisma = global as unknown as { prisma?: any }

export function getPrisma() {
	if (!PrismaClient) return null
	try {
		const instance = globalForPrisma.prisma ?? new PrismaClient()
		if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = instance
		return instance as InstanceType<typeof PrismaClient>
	} catch (e) {
		// Si Prisma no está generado o falla inicialización, retornar null para activar fallbacks
		return null
	}
}
