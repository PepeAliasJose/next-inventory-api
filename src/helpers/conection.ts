import { PrismaClient } from '../../generated/prisma'

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://base:base@localhost:3306/base_main'
    }
  }
})
