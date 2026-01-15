import { PrismaClient, UserRole, UnitType, TenantStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({})

async function main() {
  console.log('Seeding database...')
  
  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@monteza.com',
      phone: '254712345678',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      apartment: 'ADMIN',
      unitType: UnitType.TWO_BEDROOM,
      rentAmount: 0,
      waterRate: 150,
      balance: 0,
      status: TenantStatus.CURRENT,
      moveInDate: new Date(),
    }
  })
  console.log('Created admin:', admin.email)
  
  // Create one test tenant
  const hashedTenantPassword = await bcrypt.hash('password123', 10)
  const tenant = await prisma.user.create({
    data: {
      email: 'john.kamau@monteza.com',
      phone: '254711111111',
      password: hashedTenantPassword,
      name: 'John Kamau',
      role: UserRole.TENANT,
      apartment: '1A1',
      unitType: UnitType.TWO_BEDROOM,
      rentAmount: 18000,
      waterRate: 150,
      balance: 0,
      status: TenantStatus.CURRENT,
      moveInDate: new Date(),
    }
  })
  console.log('Created tenant:', tenant.email)
  
  console.log('Seeding complete!')
  console.log('Admin: admin@monteza.com / admin123')
  console.log('Tenant: john.kamau@monteza.com / password123')
}

main()
  .catch(e => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
