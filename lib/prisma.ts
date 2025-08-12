import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

// This is used to ensure that the Prisma Client is only instantiated once in development mode, preventing issues with hot reloading.
// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['query', 'error', 'warn'], // Optional: remove in production if too noisy
//   })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
