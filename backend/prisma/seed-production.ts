import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production seed...')
  
  // Check if data already exists
  const existingUsers = await prisma.user.count()
  
  if (existingUsers > 0) {
    console.log(`✅ Database already has ${existingUsers} users, skipping seed...`)
    return
  }
  
  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@monteza.com',
      phone: '254712345678',
      password: hashedAdminPassword,
      name: 'Montez A Management',
      role: 'ADMIN',
      apartment: 'ADMIN',
      unitType: 'TWO_BEDROOM',
      rentAmount: 0,
      waterRate: 150,
      balance: 0,
      status: 'CURRENT',
      moveInDate: new Date('2023-01-01'),
      notes: 'System Administrator'
    }
  })
  
  console.log('✅ Created admin user:', admin.email)
  
  // Create sample tenant
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'john.kamau@monteza.com',
      phone: '254712345601',
      password: hashedPassword,
      name: 'John Kamau',
      role: 'TENANT',
      apartment: '1A1',
      unitType: 'TWO_BEDROOM',
      rentAmount: 18000,
      waterRate: 150,
      balance: 0,
      status: 'CURRENT',
      moveInDate: new Date('2023-05-15'),
      emergencyContact: '254722345601',
      notes: 'First floor two-bedroom apartment'
    }
  })
  
  console.log('✅ Created sample tenant: John Kamau in 1A1')
  console.log('🎉 Production seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })