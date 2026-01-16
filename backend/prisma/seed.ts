import { PrismaClient, UserRole, UnitType, TenantStatus, PaymentType, PaymentMethod, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const MONTEZ_A_APARTMENTS = [
  // First Floor
  { number: '1A1', floor: 1, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '1A2', floor: 1, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '1B1', floor: 1, type: UnitType.ONE_BEDROOM, rent: 15000 },
  { number: '1B2', floor: 1, type: UnitType.ONE_BEDROOM, rent: 15000 },
  
  // Second Floor
  { number: '2A1', floor: 2, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '2A2', floor: 2, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '2B1', floor: 2, type: UnitType.ONE_BEDROOM, rent: 15000 },
  { number: '2B2', floor: 2, type: UnitType.ONE_BEDROOM, rent: 15000 },
  
  // Third Floor
  { number: '3A1', floor: 3, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '3A2', floor: 3, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '3B1', floor: 3, type: UnitType.ONE_BEDROOM, rent: 15000 },
  { number: '3B2', floor: 3, type: UnitType.ONE_BEDROOM, rent: 15000 },
  
  // Fourth Floor
  { number: '4A1', floor: 4, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '4A2', floor: 4, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '4B1', floor: 4, type: UnitType.ONE_BEDROOM, rent: 15000 },
  { number: '4B2', floor: 4, type: UnitType.ONE_BEDROOM, rent: 15000 },
  
  // Fifth Floor
  { number: '5A1', floor: 5, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '5A2', floor: 5, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '5B1', floor: 5, type: UnitType.ONE_BEDROOM, rent: 15000 },
  { number: '5B2', floor: 5, type: UnitType.ONE_BEDROOM, rent: 15000 },
  
  // Sixth Floor (Rooftop - Two Bedrooms Only)
  { number: '6A1', floor: 6, type: UnitType.TWO_BEDROOM, rent: 18000 },
  { number: '6A2', floor: 6, type: UnitType.TWO_BEDROOM, rent: 18000 },
]

const tenantData = [
  // First Floor Tenants
  { name: 'John Kamau', email: 'john.kamau@monteza.com', phone: '254712345601', emergencyContact: '254722345601', balance: 0, status: 'CURRENT' },
  { name: 'Mary Wanjiku', email: 'mary.wanjiku@monteza.com', phone: '254712345602', emergencyContact: '254722345602', balance: 7500, status: 'CURRENT' },
  { name: 'Peter Kariuki', email: 'peter.kariuki@monteza.com', phone: '254712345603', emergencyContact: '254722345603', balance: 0, status: 'CURRENT' },
  { name: 'Jane Muthoni', email: 'jane.muthoni@monteza.com', phone: '254712345604', emergencyContact: '254722345604', balance: 15000, status: 'OVERDUE' },
  
  // Second Floor Tenants
  { name: 'David Omondi', email: 'david.omondi@monteza.com', phone: '254712345605', emergencyContact: '254722345605', balance: 0, status: 'CURRENT' },
  { name: 'Sarah Atieno', email: 'sarah.atieno@monteza.com', phone: '254712345606', emergencyContact: '254722345606', balance: 9000, status: 'CURRENT' },
  { name: 'James Mutua', email: 'james.mutua@monteza.com', phone: '254712345607', emergencyContact: '254722345607', balance: 0, status: 'CURRENT' },
  { name: 'Elizabeth Njeri', email: 'elizabeth.njeri@monteza.com', phone: '254712345608', emergencyContact: '254722345608', balance: 0, status: 'CURRENT' },
  
  // Third Floor Tenants
  { name: 'Michael Otieno', email: 'michael.otieno@monteza.com', phone: '254712345609', emergencyContact: '254722345609', balance: 0, status: 'CURRENT' },
  { name: 'Grace Akinyi', email: 'grace.akinyi@monteza.com', phone: '254712345610', emergencyContact: '254722345610', balance: 18000, status: 'OVERDUE' },
  { name: 'Robert Mwangi', email: 'robert.mwangi@monteza.com', phone: '254712345611', emergencyContact: '254722345611', balance: 0, status: 'CURRENT' },
  { name: 'Susan Adhiambo', email: 'susan.adhiambo@monteza.com', phone: '254712345612', emergencyContact: '254722345612', balance: 4500, status: 'CURRENT' },
  
  // Fourth Floor Tenants
  { name: 'William Maina', email: 'william.maina@monteza.com', phone: '254712345613', emergencyContact: '254722345613', balance: 0, status: 'CURRENT' },
  { name: 'Margaret Nyambura', email: 'margaret.nyambura@monteza.com', phone: '254712345614', emergencyContact: '254722345614', balance: 0, status: 'CURRENT' },
  { name: 'Joseph Ndungu', email: 'joseph.ndungu@monteza.com', phone: '254712345615', emergencyContact: '254722345615', balance: 12000, status: 'OVERDUE' },
  { name: 'Ruth Wangui', email: 'ruth.wangui@monteza.com', phone: '254712345616', emergencyContact: '254722345616', balance: 0, status: 'CURRENT' },
  
  // Fifth Floor Tenants
  { name: 'Charles Githinji', email: 'charles.githinji@monteza.com', phone: '254712345617', emergencyContact: '254722345617', balance: 0, status: 'CURRENT' },
  { name: 'Dorothy Wairimu', email: 'dorothy.wairimu@monteza.com', phone: '254712345618', emergencyContact: '254722345618', balance: 0, status: 'CURRENT' },
  { name: 'Thomas Kioko', email: 'thomas.kioko@monteza.com', phone: '254712345619', emergencyContact: '254722345619', balance: 7500, status: 'CURRENT' },
  { name: 'Joyce Nyokabi', email: 'joyce.nyokabi@monteza.com', phone: '254712345620', emergencyContact: '254722345620', balance: 0, status: 'CURRENT' },
  
  // Sixth Floor Tenants
  { name: 'Daniel Omolo', email: 'daniel.omolo@monteza.com', phone: '254712345621', emergencyContact: '254722345621', balance: 0, status: 'CURRENT' },
  { name: 'Patricia Achieng', email: 'patricia.achieng@monteza.com', phone: '254712345622', emergencyContact: '254722345622', balance: 18000, status: 'DELINQUENT' },
  { name: 'George Waweru', email: 'george.waweru@monteza.com', phone: '254712345623', emergencyContact: '254722345623', balance: 0, status: 'CURRENT' },
  { name: 'Monica Wangari', email: 'monica.wangari@monteza.com', phone: '254712345624', emergencyContact: '254722345624', balance: 9000, status: 'CURRENT' },
  
  // Extra tenants for 2 more apartments
  { name: 'Brian Kimani', email: 'brian.kimani@monteza.com', phone: '254712345625', emergencyContact: '254722345625', balance: 0, status: 'CURRENT' },
  { name: 'Lucy Nyaguthii', email: 'lucy.nyaguthii@monteza.com', phone: '254712345626', emergencyContact: '254722345626', balance: 0, status: 'CURRENT' }
]

async function main() {
  console.log('��� Starting database seeding...')
  
  // Clear existing data (in correct order due to foreign key constraints)
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.maintenanceRequest.deleteMany()
  await prisma.analyticsSnapshot.deleteMany()
  await prisma.waterReading.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('���️ Cleared existing data')
  
  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@monteza.com',
      phone: '254712345678',
      password: hashedAdminPassword,
      name: 'Montez A Management',
      role: UserRole.ADMIN,
      apartment: 'ADMIN',
      unitType: UnitType.TWO_BEDROOM,
      rentAmount: 0,
      waterRate: 150,
      balance: 0,
      status: TenantStatus.CURRENT,
      moveInDate: new Date('2023-01-01'),
      notes: 'System Administrator'
    }
  })
  console.log(`��� Created admin user: ${admin.email}`)
  
  // Create tenants for each apartment
  const tenants = []
  const currentDate = new Date()
  
  for (let i = 0; i < MONTEZ_A_APARTMENTS.length; i++) {
    const apartment = MONTEZ_A_APARTMENTS[i]
    const tenantInfo = tenantData[i]
    
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Random move-in date within last 1-3 years
    const moveInDate = new Date(currentDate)
    moveInDate.setMonth(moveInDate.getMonth() - (12 + Math.floor(Math.random() * 24)))
    
    // Lease end date (1-2 years from move-in)
    const leaseEndDate = new Date(moveInDate)
    leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1 + Math.floor(Math.random()))
    
    const tenant = await prisma.user.create({
      data: {
        email: tenantInfo.email,
        phone: tenantInfo.phone,
        password: hashedPassword,
        name: tenantInfo.name,
        role: UserRole.TENANT,
        apartment: apartment.number,
        unitType: apartment.type,
        rentAmount: apartment.rent,
        waterRate: 150,
        balance: tenantInfo.balance,
        status: tenantInfo.status as TenantStatus,
        moveInDate,
        leaseEndDate,
        emergencyContact: tenantInfo.emergencyContact,
        notes: `${apartment.type} apartment on floor ${apartment.floor}`
      }
    })
    
    tenants.push(tenant)
    console.log(`��� Created tenant: ${tenant.name} in ${tenant.apartment} (Balance: KSh ${tenant.balance})`)
    
    // Create payments for the tenant (last 4 months with varied amounts)
    const months = [
      { month: '2024-01', year: 2024 },
      { month: '2024-02', year: 2024 },
      { month: '2024-03', year: 2024 },
      { month: '2024-04', year: 2024 }
    ]
    
    for (const monthData of months) {
      // Different payment scenarios
      const isCurrentMonth = monthData.month === '2024-04'
      const isPreviousMonth = monthData.month === '2024-03'
      const isOverdue = tenantInfo.balance > 0 && monthData.month === '2024-04'
      
      let paymentStatus: PaymentStatus
      let amount: number
      
      if (isOverdue) {
        paymentStatus = PaymentStatus.PENDING
        amount = apartment.rent * 0.7 // Only paid 70% if overdue
      } else if (isCurrentMonth) {
        paymentStatus = Math.random() > 0.2 ? PaymentStatus.VERIFIED : PaymentStatus.PENDING
        amount = apartment.rent
      } else if (isPreviousMonth) {
        paymentStatus = PaymentStatus.VERIFIED
        amount = apartment.rent * 0.95 // Some paid 95% last month
      } else {
        paymentStatus = PaymentStatus.VERIFIED
        amount = apartment.rent
      }
      
      const isVerified = paymentStatus === PaymentStatus.VERIFIED
      const method = Math.random() > 0.3 ? PaymentMethod.MPESA : PaymentMethod.CASH
      
      const payment = await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          type: PaymentType.RENT,
          method: method,
          amount: amount,
          currency: 'KES',
          month: monthData.month,
          year: monthData.year,
          description: `Rent payment for ${monthData.month}`,
          transactionCode: isVerified && method === PaymentMethod.MPESA ? `MP${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
          caretakerName: !isVerified && method === PaymentMethod.CASH ? 'Mwarabu' : null,
          status: paymentStatus,
          screenshotUrls: isVerified ? [`/uploads/${tenant.id}/payment-${monthData.month}.jpg`] : [],
          verifiedAt: isVerified ? new Date() : null,
          verifiedBy: isVerified ? admin.id : null,
        }
      })
      
      // Create receipt for verified payments
      if (isVerified) {
        await prisma.receipt.create({
          data: {
            paymentId: payment.id,
            tenantId: tenant.id,
            receiptNumber: `MTA-${monthData.month.replace('-', '')}-${String(i+1).padStart(3, '0')}`,
            filePath: `/receipts/${payment.id}.pdf`,
            generatedAt: new Date(),
          }
        })
      }
      
      // Create water readings with varied consumption
      const waterUnits = Math.floor(Math.random() * 8) + 3 // 3-10 units
      const waterAmount = waterUnits * 150
      
      const waterPaid = isVerified || (Math.random() > 0.3) // 70% water bills paid
      
      await prisma.waterReading.create({
        data: {
          tenantId: tenant.id,
          previousReading: i * 100,
          currentReading: i * 100 + waterUnits,
          units: waterUnits,
          rate: 150,
          amount: waterAmount,
          month: monthData.month,
          year: monthData.year,
          paid: waterPaid,
          paymentId: waterPaid ? payment.id : null,
        }
      })
    }
  }
  
  // Create comprehensive analytics snapshot
  const totalUnits = MONTEZ_A_APARTMENTS.length
  const occupiedUnits = tenants.length
  const totalRentDue = tenants.reduce((sum, t) => sum + t.rentAmount * 4, 0) // 4 months
  const totalRentPaid = tenants.reduce((sum, t) => sum + (t.rentAmount * 3 * 0.85), 0) // 85% of 3 months
  const totalBalance = tenants.reduce((sum, t) => sum + t.balance, 0)
  
  await prisma.analyticsSnapshot.create({
    data: {
      date: new Date(),
      totalRentDue,
      totalRentPaid,
      totalBalance,
      totalWaterDue: 46800, // 26 apartments × 3 months × 150 × 4 units avg
      totalWaterPaid: 42120, // 90% paid
      totalOtherDue: 0,
      totalOtherPaid: 0,
      totalUnits,
      occupiedUnits,
      vacantUnits: 0, // All occupied
      maintenanceUnits: 3,
      occupancyRate: 100,
      vacancyRate: 0,
      pendingPayments: Math.floor(tenants.length * 0.25), // 25% pending
      verifiedPayments: Math.floor(tenants.length * 3 * 0.85), // 85% of 3 months verified
      rejectedPayments: 2,
      currentTenants: tenants.filter(t => t.status === 'CURRENT').length,
      overdueTenants: tenants.filter(t => t.status === 'OVERDUE').length,
      delinquentTenants: tenants.filter(t => t.status === 'DELINQUENT').length,
    }
  })
  
  console.log('��� Created analytics snapshot')
  
  // Create realistic maintenance requests
  const maintenanceRequests = [
    { title: 'Leaking kitchen faucet', priority: 'HIGH', status: 'COMPLETED', floor: 1 },
    { title: 'AC not cooling properly', priority: 'HIGH', status: 'IN_PROGRESS', floor: 2 },
    { title: 'Broken window lock', priority: 'MEDIUM', status: 'PENDING', floor: 3 },
    { title: 'Toilet flush not working', priority: 'HIGH', status: 'COMPLETED', floor: 4 },
    { title: 'Electrical socket sparking', priority: 'HIGH', status: 'IN_PROGRESS', floor: 5 },
    { title: 'Water heater issue', priority: 'MEDIUM', status: 'PENDING', floor: 6 },
    { title: 'Door handle loose', priority: 'LOW', status: 'COMPLETED', floor: 1 },
    { title: 'Paint peeling in living room', priority: 'LOW', status: 'PENDING', floor: 2 },
    { title: 'Balcony door stuck', priority: 'MEDIUM', status: 'COMPLETED', floor: 3 },
    { title: 'Kitchen cabinet hinge broken', priority: 'LOW', status: 'PENDING', floor: 4 }
  ]
  
  for (const request of maintenanceRequests) {
    // Find a tenant on the specified floor
    const floorTenants = tenants.filter(t => {
      const aptNumber = t.apartment
      const floor = parseInt(aptNumber.charAt(0))
      return floor === request.floor
    })
    
    if (floorTenants.length > 0) {
      const tenant = floorTenants[Math.floor(Math.random() * floorTenants.length)]
      
      await prisma.maintenanceRequest.create({
        data: {
          tenantId: tenant.id,
          title: request.title,
          description: `Reported by ${tenant.name} in apartment ${tenant.apartment}. ${request.priority === 'HIGH' ? 'Needs urgent attention.' : ''}`,
          priority: request.priority,
          status: request.status,
          apartment: tenant.apartment,
          imageUrls: [`/uploads/maintenance/${tenant.id}/${request.title.toLowerCase().replace(/ /g, '-')}.jpg`],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
          ...(request.status === 'COMPLETED' ? { 
            resolvedAt: new Date(),
            resolutionNotes: 'Issue has been resolved by maintenance team.'
          } : {})
        }
      })
    }
  }
  
  console.log('��� Created maintenance requests')
  
  // Create realistic notifications
  const notificationTypes = [
    { type: 'PAYMENT', title: 'Rent Payment Due', template: 'Your rent payment for {month} is due on 5th {month}' },
    { type: 'MAINTENANCE', title: 'Maintenance Update', template: 'Your maintenance request for {issue} has been updated to {status}' },
    { type: 'WATER', title: 'Water Reading Reminder', template: 'Please submit your water meter reading by end of month' },
    { type: 'SYSTEM', title: 'System Announcement', template: 'System maintenance scheduled for this weekend' },
    { type: 'ALERT', title: 'Important Notice', template: 'Water will be shut off for maintenance on {date}' }
  ]
  
  const months = ['January', 'February', 'March', 'April']
  
  for (let i = 0; i < 20; i++) {
    const tenant = tenants[Math.floor(Math.random() * tenants.length)]
    const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
    const month = months[Math.floor(Math.random() * months.length)]
    
    let message = notificationType.template
      .replace('{month}', month)
      .replace('{issue}', 'leaking faucet')
      .replace('{status}', 'in progress')
      .replace('{date}', '25th ' + month)
    
    await prisma.notification.create({
      data: {
        userId: tenant.id,
        title: notificationType.title,
        message: message,
        type: notificationType.type,
        read: Math.random() > 0.6,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Last 7 days
      }
    })
  }
  
  // Also create some admin notifications
  for (let i = 0; i < 5; i++) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Admin Alert',
        message: `System report: ${['Payment overdue', 'New tenant registration', 'Maintenance request', 'Water reading missing', 'Monthly analytics'][i]}`,
        type: 'SYSTEM',
        read: false,
      }
    })
  }
  
  console.log('��� Created notifications')
  
  console.log('✅ Database seeding completed!')
  console.log(`🏢 Building: Montez A Apartments`)
  console.log(`📊 Total Apartments: ${MONTEZ_A_APARTMENTS.length}`)
  console.log(`   • 6 Floors (1st to 6th)`)
  console.log(`   • 20 Two-bedroom units`)
  console.log(`   • 6 One-bedroom units`)
  console.log(`👥 Created: ${tenants.length + 1} users (1 admin, ${tenants.length} tenants)`)
  console.log(`💰 Created: ${tenants.length * 4} payments (4 months each)`)
  console.log(`🧾 Created: ${tenants.length * 3} receipts (3 months verified)`)
  console.log(`💧 Created: ${tenants.length * 4} water readings`)
  console.log(`🔧 Created: ${maintenanceRequests.length} maintenance requests`)
  console.log(`🔔 Created: 25 notifications`)
  console.log(`📈 Occupancy Rate: 100%`)
  console.log(`💵 Total Outstanding Balance: KSh ${tenants.reduce((sum, t) => sum + t.balance, 0).toLocaleString()}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })