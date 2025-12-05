import { PrismaClient, UserRole, UnitType, TenantStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const MONTEZ_A_APARTMENTS = [
  // Floor 1
  { number: '1A1', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1A2', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1B1', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '1B2', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 2
  { number: '2A1', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2A2', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2B1', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '2B2', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 3
  { number: '3A1', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3A2', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3B1', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '3B2', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 4
  { number: '4A1', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4A2', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4B1', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '4B2', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 5
  { number: '5A1', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5A2', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5B1', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '5B2', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Rooftop
  { number: '6A1', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '6A2', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
]

const tenantNames = [
  'John Kamau', 'Mary Wanjiku', 'Peter Kariuki', 'Jane Muthoni',
  'David Omondi', 'Sarah Atieno', 'James Mutua', 'Elizabeth Njeri',
  'Michael Otieno', 'Grace Akinyi', 'Robert Mwangi', 'Susan Adhiambo',
  'William Maina', 'Margaret Nyambura', 'Joseph Ndungu', 'Ruth Wangui',
  'Charles Githinji', 'Dorothy Wairimu', 'Thomas Kioko', 'Joyce Nyokabi',
  'Daniel Omolo', 'Patricia Achieng', 'George Waweru', 'Monica Wangari'
]

async function main() {
  console.log('🌱 Starting database seeding...')
  
  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.maintenanceRequest.deleteMany()
  await prisma.analyticsSnapshot.deleteMany()
  await prisma.waterReading.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('🗑️ Cleared existing data')
  
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
  console.log(`👑 Created admin user: ${admin.email}`)
  
  // Create tenants for each apartment
  const tenants = []
  const currentDate = new Date()
  
  for (let i = 0; i < Math.min(MONTEZ_A_APARTMENTS.length, tenantNames.length); i++) {
    const apartment = MONTEZ_A_APARTMENTS[i]
    const tenantName = tenantNames[i]
    const email = tenantName.toLowerCase().replace(' ', '.') + '@monteza.com'
    const phone = `2547${10000000 + i}`
    
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Random move-in date within last 2 years
    const moveInDate = new Date(currentDate)
    moveInDate.setMonth(moveInDate.getMonth() - Math.floor(Math.random() * 24))
    
    // Random lease end date (6 months to 2 years from move-in)
    const leaseEndDate = new Date(moveInDate)
    leaseEndDate.setMonth(leaseEndDate.getMonth() + 6 + Math.floor(Math.random() * 18))
    
    const tenant = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name: tenantName,
        role: UserRole.TENANT,
        apartment: apartment.number,
        unitType: apartment.type,
        rentAmount: apartment.rent,
        waterRate: 150,
        balance: Math.random() > 0.8 ? apartment.rent * (Math.random() * 0.5) : 0, // 20% chance of having balance
        status: TenantStatus.CURRENT,
        moveInDate,
        leaseEndDate,
        emergencyContact: `2547${20000000 + i}`,
        notes: `Tenant for ${apartment.number} - ${apartment.type.replace('_', ' ')}`
      }
    })
    
    tenants.push(tenant)
    console.log(`🏠 Created tenant: ${tenant.name} in ${tenant.apartment}`)
    
    // Create payments for the tenant (last 3 months)
    const months = ['2024-01', '2024-02', '2024-03']
    for (const month of months) {
      const paymentStatus = Math.random() > 0.1 ? 'VERIFIED' : 'PENDING' // 90% verified, 10% pending
      const isVerified = paymentStatus === 'VERIFIED'
      
      const payment = await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          type: 'RENT',
          method: Math.random() > 0.3 ? 'MPESA' : 'CASH', // 70% M-Pesa, 30% cash
          amount: apartment.rent,
          currency: 'KES',
          month,
          year: parseInt(month.split('-')[0]),
          description: `Rent payment for ${month}`,
          transactionCode: paymentStatus === 'VERIFIED' ? `MP${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
          status: paymentStatus,
          screenshotUrls: isVerified ? [`/uploads/${tenant.id}/payment-${month}.jpg`] : [],
          verifiedAt: isVerified ? new Date() : null,
          verifiedBy: isVerified ? admin.id : null,
        }
      })
      
      // Create receipt for verified payments
      if (isVerified) {
        await prisma.receipt.create({
          data: {
            paymentId: payment.id,
            receiptNumber: `MTA-${month.replace('-', '')}-${String(i+1).padStart(3, '0')}`,
            filePath: `/receipts/${payment.id}.pdf`,
            generatedAt: new Date(),
          }
        })
      }
      
      // Create water readings
      const waterUnits = Math.floor(Math.random() * 10) + 1 // 1-10 units
      const waterAmount = waterUnits * 150
      
      await prisma.waterReading.create({
        data: {
          tenantId: tenant.id,
          previousReading: i * 100,
          currentReading: i * 100 + waterUnits,
          units: waterUnits,
          rate: 150,
          amount: waterAmount,
          month,
          year: parseInt(month.split('-')[0]),
          paid: isVerified,
          paymentId: isVerified ? payment.id : null,
        }
      })
    }
  }
  
  // Create analytics snapshot
  const totalUnits = MONTEZ_A_APARTMENTS.length
  const occupiedUnits = tenants.length
  const occupancyRate = (occupiedUnits / totalUnits) * 100
  
  await prisma.analyticsSnapshot.create({
    data: {
      date: new Date(),
      totalRentDue: tenants.reduce((sum, t) => sum + t.rentAmount, 0),
      totalRentPaid: tenants.reduce((sum, t) => sum + t.rentAmount * 0.9, 0), // 90% collection rate
      totalWaterDue: 12000,
      totalWaterPaid: 10800,
      totalOtherDue: 0,
      totalOtherPaid: 0,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      maintenanceUnits: 0,
      occupancyRate,
      vacancyRate: 100 - occupancyRate,
      pendingPayments: Math.floor(tenants.length * 0.1), // 10% pending
      verifiedPayments: Math.floor(tenants.length * 0.9), // 90% verified
      rejectedPayments: 0,
      currentTenants: Math.floor(tenants.length * 0.85), // 85% current
      overdueTenants: Math.floor(tenants.length * 0.1), // 10% overdue
      delinquentTenants: Math.floor(tenants.length * 0.05), // 5% delinquent
    }
  })
  
  console.log('📊 Created analytics snapshot')
  
  // Create some maintenance requests
  const maintenanceTitles = [
    'Leaking faucet in kitchen',
    'Broken window lock',
    'AC not cooling properly',
    'Toilet flush not working',
    'Electrical socket sparking',
    'Water heater issue',
    'Door handle loose',
    'Paint peeling in living room'
  ]
  
  for (let i = 0; i < 5; i++) {
    const tenant = tenants[Math.floor(Math.random() * tenants.length)]
    
    await prisma.maintenanceRequest.create({
      data: {
        tenantId: tenant.id,
        title: maintenanceTitles[Math.floor(Math.random() * maintenanceTitles.length)],
        description: 'Need urgent attention',
        priority: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
        status: Math.random() > 0.5 ? 'PENDING' : 'IN_PROGRESS',
        apartment: tenant.apartment,
        imageUrls: [`/uploads/maintenance/${tenant.id}/issue-${i}.jpg`],
      }
    })
  }
  
  console.log('🔧 Created maintenance requests')
  
  console.log('✅ Database seeding completed!')
  console.log(`👥 Created: ${tenants.length + 1} users`)
  console.log(`💳 Created: ${tenants.length * 3} payments`)
  console.log(`🧾 Created: ${tenants.length * 3} receipts`)
  console.log(`💧 Created: ${tenants.length * 3} water readings`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })