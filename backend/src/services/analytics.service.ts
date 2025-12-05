import { prisma } from '../lib/prisma'
import { config } from '../config'
import { startOfDay, endOfDay, subDays, format, eachMonthOfInterval } from 'date-fns'
import PDFDocument from 'pdfkit'
import { MONTEZ_A_APARTMENTS } from '../utils/constants'

export interface FinancialReportOptions {
  startDate?: Date
  endDate?: Date
  period?: 'day' | 'week' | 'month' | 'year'
}

export interface OccupancyReport {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  occupancyRate: number
  vacancyRate: number
  floorBreakdown: {
    floor: number
    total: number
    occupied: number
    occupancyRate: number
  }[]
  unitTypeBreakdown: {
    type: string
    total: number
    occupied: number
    occupancyRate: number
  }[]
}

export interface FinancialReport {
  period: string
  revenue: {
    rent: number
    water: number
    other: number
    total: number
  }
  expenses: {
    maintenance: number
    utilities: number
    staff: number
    other: number
    total: number
  }
  profit: number
  collectionRate: number
  outstandingAmount: number
  monthlyTrends: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
    occupancyRate: number
  }>
}

export class AnalyticsService {
  async generateDailySnapshot(): Promise<void> {
    try {
      const currentDate = new Date()
      const startOfToday = startOfDay(currentDate)
      
      // Check if snapshot already exists for today
      const existingSnapshot = await prisma.analyticsSnapshot.findUnique({
        where: { date: startOfToday },
      })

      if (existingSnapshot) {
        console.log('Snapshot already exists for today')
        return
      }

      // Get total units (Montez A has 26 apartments)
      const totalUnits = 26

      // Get occupancy data
      const tenants = await prisma.user.findMany({
        where: {
          role: 'TENANT',
          status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] },
        },
      })

      const occupiedUnits = tenants.length
      const vacantUnits = totalUnits - occupiedUnits
      const occupancyRate = (occupiedUnits / totalUnits) * 100

      // Get financial data for current month
      const currentMonth = currentDate.toISOString().slice(0, 7)

      const [payments, waterReadings] = await Promise.all([
        prisma.payment.findMany({
          where: {
            month: currentMonth,
          },
        }),
        prisma.waterReading.findMany({
          where: {
            month: currentMonth,
          },
        }),
      ])

      // Calculate totals
      const totalRentDue = tenants.reduce((sum, t) => sum + t.rentAmount, 0)
      const totalRentPaid = payments
        .filter(p => p.type === 'RENT' && p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.amount, 0)

      const totalWaterDue = waterReadings.reduce((sum, r) => sum + r.amount, 0)
      const totalWaterPaid = waterReadings
        .filter(r => r.paid)
        .reduce((sum, r) => sum + r.amount, 0)

      const totalOtherDue = payments
        .filter(p => p.type === 'OTHER' || p.type === 'MAINTENANCE')
        .reduce((sum, p) => sum + p.amount, 0)

      const totalOtherPaid = payments
        .filter(p => (p.type === 'OTHER' || p.type === 'MAINTENANCE') && p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.amount, 0)

      // Count payments by status
      const pendingPayments = payments.filter(p => p.status === 'PENDING').length
      const verifiedPayments = payments.filter(p => p.status === 'VERIFIED').length
      const rejectedPayments = payments.filter(p => p.status === 'REJECTED').length

      // Count tenants by status
      const currentTenants = tenants.filter(t => t.status === 'CURRENT').length
      const overdueTenants = tenants.filter(t => t.status === 'OVERDUE').length
      const delinquentTenants = tenants.filter(t => t.status === 'DELINQUENT').length

      // Create snapshot
      await prisma.analyticsSnapshot.create({
        data: {
          date: startOfToday,
          totalRentDue,
          totalRentPaid,
          totalWaterDue,
          totalWaterPaid,
          totalOtherDue,
          totalOtherPaid,
          totalUnits,
          occupiedUnits,
          vacantUnits,
          maintenanceUnits: 0, // You might want to track this separately
          occupancyRate,
          vacancyRate: 100 - occupancyRate,
          pendingPayments,
          verifiedPayments,
          rejectedPayments,
          currentTenants,
          overdueTenants,
          delinquentTenants,
        },
      })

      console.log('Daily analytics snapshot created')
    } catch (error) {
      console.error('Error generating daily snapshot:', error)
      throw error
    }
  }

  async generateFinancialReport(options: FinancialReportOptions): Promise<FinancialReport> {
    const { startDate, endDate, period = 'month' } = options
    
    const currentDate = new Date()
    const reportStartDate = startDate || subDays(currentDate, 30)
    const reportEndDate = endDate || currentDate

    // Get all payments in the period
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: reportStartDate,
          lte: reportEndDate,
        },
        status: 'VERIFIED',
      },
      include: {
        tenant: {
          select: {
            apartment: true,
            rentAmount: true,
          },
        },
      },
    })

    // Get water readings in the period
    const waterReadings = await prisma.waterReading.findMany({
      where: {
        createdAt: {
          gte: reportStartDate,
          lte: reportEndDate,
        },
        paid: true,
      },
    })

    // Calculate revenue
    const rentRevenue = payments
      .filter(p => p.type === 'RENT')
      .reduce((sum, p) => sum + p.amount, 0)

    const waterRevenue = waterReadings.reduce((sum, r) => sum + r.amount, 0)

    const otherRevenue = payments
      .filter(p => p.type === 'OTHER' || p.type === 'MAINTENANCE')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalRevenue = rentRevenue + waterRevenue + otherRevenue

    // Calculate expenses (you might want to add an Expenses model)
    // For now, using estimates
    const maintenanceExpenses = payments
      .filter(p => p.type === 'MAINTENANCE')
      .reduce((sum, p) => sum + p.amount, 0) * 0.8 // Assuming 80% of maintenance payments are expenses

    const utilitiesExpenses = waterRevenue * 0.3 // Assuming 30% of water revenue is expense
    const staffExpenses = totalRevenue * 0.15 // Assuming 15% for staff
    const otherExpenses = totalRevenue * 0.05 // Assuming 5% for other expenses

    const totalExpenses = maintenanceExpenses + utilitiesExpenses + staffExpenses + otherExpenses
    const profit = totalRevenue - totalExpenses

    // Calculate collection rate
    const tenants = await prisma.user.findMany({
      where: { role: 'TENANT' },
    })

    const expectedRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0)
    const collectionRate = expectedRent > 0 ? (rentRevenue / expectedRent) * 100 : 0

    // Calculate outstanding amount
    const outstandingAmount = tenants.reduce((sum, t) => sum + t.balance, 0)

    // Generate monthly trends
    const months = eachMonthOfInterval({
      start: reportStartDate,
      end: reportEndDate,
    })

    const monthlyTrends = await Promise.all(
      months.map(async (month) => {
        const monthStr = format(month, 'yyyy-MM')
        
        const [monthPayments, monthWater] = await Promise.all([
          prisma.payment.findMany({
            where: {
              month: monthStr,
              status: 'VERIFIED',
            },
          }),
          prisma.waterReading.findMany({
            where: {
              month: monthStr,
              paid: true,
            },
          }),
        ])

        const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0) +
                            monthWater.reduce((sum, r) => sum + r.amount, 0)

        // Get occupancy for the month
        const monthTenants = await prisma.user.findMany({
          where: {
            role: 'TENANT',
            OR: [
              { moveInDate: { lte: endOfDay(month) } },
              { moveInDate: null },
            ],
            AND: [
              { 
                OR: [
                  { leaseEndDate: { gte: startOfDay(month) } },
                  { leaseEndDate: null },
                ],
              },
              { status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] } },
            ],
          },
        })

        const monthOccupancyRate = (monthTenants.length / 26) * 100

        return {
          month: format(month, 'MMM yyyy'),
          revenue: monthRevenue,
          expenses: monthRevenue * 0.4, // Estimate expenses as 40% of revenue
          profit: monthRevenue * 0.6, // Estimate profit as 60% of revenue
          occupancyRate: monthOccupancyRate,
        }
      })
    )

    return {
      period: `${format(reportStartDate, 'dd MMM yyyy')} - ${format(reportEndDate, 'dd MMM yyyy')}`,
      revenue: {
        rent: rentRevenue,
        water: waterRevenue,
        other: otherRevenue,
        total: totalRevenue,
      },
      expenses: {
        maintenance: maintenanceExpenses,
        utilities: utilitiesExpenses,
        staff: staffExpenses,
        other: otherExpenses,
        total: totalExpenses,
      },
      profit,
      collectionRate,
      outstandingAmount,
      monthlyTrends,
    }
  }

  async generateOccupancyReport(): Promise<OccupancyReport> {
    const tenants = await prisma.user.findMany({
      where: {
        role: 'TENANT',
        status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] },
      },
    })

    const totalUnits = 26
    const occupiedUnits = tenants.length
    const vacantUnits = totalUnits - occupiedUnits
    const occupancyRate = (occupiedUnits / totalUnits) * 100

    // Floor breakdown
    const floorBreakdown = [1, 2, 3, 4, 5, 6].map(floor => {
      const floorApartments = MONTEZ_A_APARTMENTS.filter(apt => apt.floor === floor)
      const floorTotal = floorApartments.length
      const floorOccupied = tenants.filter(t => 
        floorApartments.some(apt => apt.number === t.apartment)
      ).length
      
      return {
        floor,
        total: floorTotal,
        occupied: floorOccupied,
        occupancyRate: floorTotal > 0 ? (floorOccupied / floorTotal) * 100 : 0,
      }
    })

    // Unit type breakdown
    const unitTypeBreakdown = [
      { type: 'ONE_BEDROOM', label: 'One Bedroom' },
      { type: 'TWO_BEDROOM', label: 'Two Bedroom' },
    ].map(typeInfo => {
      const typeApartments = MONTEZ_A_APARTMENTS.filter(apt => apt.type === typeInfo.type)
      const typeTotal = typeApartments.length
      const typeOccupied = tenants.filter(t => 
        typeApartments.some(apt => apt.number === t.apartment)
      ).length
      
      return {
        type: typeInfo.label,
        total: typeTotal,
        occupied: typeOccupied,
        occupancyRate: typeTotal > 0 ? (typeOccupied / typeTotal) * 100 : 0,
      }
    })

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits: 0,
      occupancyRate,
      vacancyRate: 100 - occupancyRate,
      floorBreakdown,
      unitTypeBreakdown,
    }
  }

  async generateTenantReport() {
    const tenants = await prisma.user.findMany({
      where: { role: 'TENANT' },
      include: {
        payments: {
          where: {
            createdAt: {
              gte: subDays(new Date(), 90), // Last 90 days
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        waterReadings: {
          orderBy: { month: 'desc' },
          take: 3,
        },
      },
    })

    const report = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      apartment: tenant.apartment,
      unitType: tenant.unitType,
      rentAmount: tenant.rentAmount,
      balance: tenant.balance,
      status: tenant.status,
      moveInDate: tenant.moveInDate,
      leaseEndDate: tenant.leaseEndDate,
      payments: {
        total: tenant.payments.length,
        verified: tenant.payments.filter(p => p.status === 'VERIFIED').length,
        pending: tenant.payments.filter(p => p.status === 'PENDING').length,
        totalAmount: tenant.payments.reduce((sum, p) => sum + p.amount, 0),
      },
      waterConsumption: {
        recentMonths: tenant.waterReadings.map(r => ({
          month: r.month,
          units: r.units,
          amount: r.amount,
          paid: r.paid,
        })),
        averageUnits: tenant.waterReadings.length > 0 
          ? tenant.waterReadings.reduce((sum, r) => sum + r.units, 0) / tenant.waterReadings.length
          : 0,
      },
    }))

    const summary = {
      totalTenants: tenants.length,
      currentTenants: tenants.filter(t => t.status === 'CURRENT').length,
      overdueTenants: tenants.filter(t => t.status === 'OVERDUE').length,
      delinquentTenants: tenants.filter(t => t.status === 'DELINQUENT').length,
      totalOutstanding: tenants.reduce((sum, t) => sum + t.balance, 0),
      averageBalance: tenants.length > 0 
        ? tenants.reduce((sum, t) => sum + t.balance, 0) / tenants.length
        : 0,
      collectionRate: tenants.length > 0
        ? (tenants.filter(t => t.balance <= 0).length / tenants.length) * 100
        : 0,
    }

    return {
      summary,
      tenants: report,
    }
  }

  async generateWaterConsumptionReport(options: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options
    
    const currentDate = new Date()
    const reportStartDate = startDate || subDays(currentDate, 90)
    const reportEndDate = endDate || currentDate

    const waterReadings = await prisma.waterReading.findMany({
      where: {
        createdAt: {
          gte: reportStartDate,
          lte: reportEndDate,
        },
      },
      include: {
        tenant: {
          select: {
            name: true,
            apartment: true,
          },
        },
      },
      orderBy: { month: 'desc' },
    })

    // Group by month
    const monthlyData: Record<string, any> = {}
    
    waterReadings.forEach(reading => {
      if (!monthlyData[reading.month]) {
        monthlyData[reading.month] = {
          month: reading.month,
          totalUnits: 0,
          totalAmount: 0,
          paidUnits: 0,
          paidAmount: 0,
          readings: [],
        }
      }
      
      monthlyData[reading.month].totalUnits += reading.units
      monthlyData[reading.month].totalAmount += reading.amount
      
      if (reading.paid) {
        monthlyData[reading.month].paidUnits += reading.units
        monthlyData[reading.month].paidAmount += reading.amount
      }
      
      monthlyData[reading.month].readings.push({
        apartment: reading.tenant.apartment,
        tenantName: reading.tenant.name,
        units: reading.units,
        amount: reading.amount,
        paid: reading.paid,
      })
    })

    const monthlyArray = Object.values(monthlyData)
      .sort((a, b) => b.month.localeCompare(a.month))

    // Calculate overall statistics
    const totalUnits = waterReadings.reduce((sum, r) => sum + r.units, 0)
    const totalAmount = waterReadings.reduce((sum, r) => sum + r.amount, 0)
    const paidUnits = waterReadings.filter(r => r.paid).reduce((sum, r) => sum + r.units, 0)
    const paidAmount = waterReadings.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0)

    // Find highest and lowest consumers
    const consumptionByApartment: Record<string, number> = {}
    
    waterReadings.forEach(reading => {
      if (!consumptionByApartment[reading.tenant.apartment]) {
        consumptionByApartment[reading.tenant.apartment] = 0
      }
      consumptionByApartment[reading.tenant.apartment] += reading.units
    })

    const apartmentConsumption = Object.entries(consumptionByApartment)
      .map(([apartment, units]) => ({ apartment, units }))
      .sort((a, b) => b.units - a.units)

    const highestConsumer = apartmentConsumption[0]
    const lowestConsumer = apartmentConsumption[apartmentConsumption.length - 1]

    return {
      period: {
        start: reportStartDate,
        end: reportEndDate,
      },
      summary: {
        totalUnits,
        totalAmount,
        paidUnits,
        paidAmount,
        paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
        averageUnitsPerMonth: monthlyArray.length > 0 
          ? totalUnits / monthlyArray.length
          : 0,
        averageAmountPerMonth: monthlyArray.length > 0 
          ? totalAmount / monthlyArray.length
          : 0,
      },
      monthlyData: monthlyArray,
      apartmentRanking: apartmentConsumption,
      extremes: {
        highestConsumer,
        lowestConsumer,
      },
    }
  }

  convertToCSV(data: any): string {
    const flattenObject = (obj: any, prefix = ''): any[] => {
      return Object.keys(obj).reduce((acc: any[], key) => {
        const pre = prefix.length ? `${prefix}.` : ''
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          acc.push(...flattenObject(obj[key], pre + key))
        } else if (Array.isArray(obj[key])) {
          // Handle arrays by joining with semicolons
          acc.push([pre + key, obj[key].join('; ')])
        } else {
          acc.push([pre + key, obj[key]])
        }
        
        return acc
      }, [])
    }

    const flattened = flattenObject(data)
    const csvRows = flattened.map(row => row.map(cell => `"${cell}"`).join(','))
    
    return csvRows.join('\n')
  }

  async generatePDFReport(data: any, reportType: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        // Header
        doc.fontSize(20).text(config.appName, { align: 'center' })
        doc.moveDown()
        doc.fontSize(16).text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, { align: 'center' })
        doc.moveDown()
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
        doc.moveDown(2)

        // Content based on report type
        switch (reportType) {
          case 'financial':
            this.generateFinancialPDF(doc, data)
            break
          case 'occupancy':
            this.generateOccupancyPDF(doc, data)
            break
          case 'tenant':
            this.generateTenantPDF(doc, data)
            break
          case 'water':
            this.generateWaterPDF(doc, data)
            break
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private generateFinancialPDF(doc: PDFDocument, data: FinancialReport) {
    doc.fontSize(14).text('Financial Summary', { underline: true })
    doc.moveDown()
    
    doc.fontSize(12).text(`Period: ${data.period}`)
    doc.moveDown()

    // Revenue section
    doc.fontSize(12).text('Revenue:', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Rent: KSh ${data.revenue.rent.toLocaleString()}`)
    doc.text(`Water: KSh ${data.revenue.water.toLocaleString()}`)
    doc.text(`Other: KSh ${data.revenue.other.toLocaleString()}`)
    doc.fontSize(11).text(`Total Revenue: KSh ${data.revenue.total.toLocaleString()}`, { bold: true })
    doc.moveDown()

    // Expenses section
    doc.fontSize(12).text('Expenses:', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Maintenance: KSh ${data.expenses.maintenance.toLocaleString()}`)
    doc.text(`Utilities: KSh ${data.expenses.utilities.toLocaleString()}`)
    doc.text(`Staff: KSh ${data.expenses.staff.toLocaleString()}`)
    doc.text(`Other: KSh ${data.expenses.other.toLocaleString()}`)
    doc.fontSize(11).text(`Total Expenses: KSh ${data.expenses.total.toLocaleString()}`, { bold: true })
    doc.moveDown()

    // Profit
    doc.fontSize(12).text(`Profit: KSh ${data.profit.toLocaleString()}`, { bold: true })
    doc.text(`Collection Rate: ${data.collectionRate.toFixed(1)}%`)
    doc.text(`Outstanding Amount: KSh ${data.outstandingAmount.toLocaleString()}`)
    doc.moveDown()

    // Monthly trends
    doc.addPage()
    doc.fontSize(14).text('Monthly Trends', { underline: true })
    doc.moveDown()

    data.monthlyTrends.forEach((trend, index) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage()
      }
      
      doc.fontSize(10).text(trend.month)
      doc.text(`  Revenue: KSh ${trend.revenue.toLocaleString()}`)
      doc.text(`  Expenses: KSh ${trend.expenses.toLocaleString()}`)
      doc.text(`  Profit: KSh ${trend.profit.toLocaleString()}`)
      doc.text(`  Occupancy: ${trend.occupancyRate.toFixed(1)}%`)
      doc.moveDown()
    })
  }

  private generateOccupancyPDF(doc: PDFDocument, data: OccupancyReport) {
    doc.fontSize(14).text('Occupancy Report', { underline: true })
    doc.moveDown()

    // Summary
    doc.fontSize(12).text('Summary:', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Total Units: ${data.totalUnits}`)
    doc.text(`Occupied Units: ${data.occupiedUnits}`)
    doc.text(`Vacant Units: ${data.vacantUnits}`)
    doc.text(`Occupancy Rate: ${data.occupancyRate.toFixed(1)}%`)
    doc.text(`Vacancy Rate: ${data.vacancyRate.toFixed(1)}%`)
    doc.moveDown()

    // Floor breakdown
    doc.fontSize(12).text('Floor Breakdown:', { underline: true })
    doc.moveDown(0.5)
    
    data.floorBreakdown.forEach(floor => {
      doc.fontSize(10).text(`Floor ${floor.floor}:`)
      doc.text(`  Total: ${floor.total}`)
      doc.text(`  Occupied: ${floor.occupied}`)
      doc.text(`  Occupancy Rate: ${floor.occupancyRate.toFixed(1)}%`)
      doc.moveDown(0.5)
    })
    doc.moveDown()

    // Unit type breakdown
    doc.fontSize(12).text('Unit Type Breakdown:', { underline: true })
    doc.moveDown(0.5)
    
    data.unitTypeBreakdown.forEach(type => {
      doc.fontSize(10).text(`${type.type}:`)
      doc.text(`  Total: ${type.total}`)
      doc.text(`  Occupied: ${type.occupied}`)
      doc.text(`  Occupancy Rate: ${type.occupancyRate.toFixed(1)}%`)
      doc.moveDown(0.5)
    })
  }

  private generateTenantPDF(doc: PDFDocument, data: any) {
    doc.fontSize(14).text('Tenant Report', { underline: true })
    doc.moveDown()

    // Summary
    doc.fontSize(12).text('Summary:', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Total Tenants: ${data.summary.totalTenants}`)
    doc.text(`Current Tenants: ${data.summary.currentTenants}`)
    doc.text(`Overdue Tenants: ${data.summary.overdueTenants}`)
    doc.text(`Delinquent Tenants: ${data.summary.delinquentTenants}`)
    doc.text(`Total Outstanding: KSh ${data.summary.totalOutstanding.toLocaleString()}`)
    doc.text(`Average Balance: KSh ${data.summary.averageBalance.toLocaleString()}`)
    doc.text(`Collection Rate: ${data.summary.collectionRate.toFixed(1)}%`)
    doc.moveDown()

    // Tenant details
    doc.addPage()
    doc.fontSize(12).text('Tenant Details:', { underline: true })
    doc.moveDown()

    data.tenants.forEach((tenant: any, index: number) => {
      if (index > 0 && index % 3 === 0) {
        doc.addPage()
      }
      
      doc.fontSize(10).text(`${tenant.name} (${tenant.apartment})`, { bold: true })
      doc.text(`Unit Type: ${tenant.unitType}`)
      doc.text(`Rent: KSh ${tenant.rentAmount.toLocaleString()}`)
      doc.text(`Balance: KSh ${tenant.balance.toLocaleString()}`)
      doc.text(`Status: ${tenant.status}`)
      doc.text(`Move-in Date: ${new Date(tenant.moveInDate).toLocaleDateString()}`)
      
      if (tenant.leaseEndDate) {
        doc.text(`Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`)
      }
      
      doc.text(`Payments: ${tenant.payments.total} (${tenant.payments.verified} verified, ${tenant.payments.pending} pending)`)
      doc.text(`Total Paid: KSh ${tenant.payments.totalAmount.toLocaleString()}`)
      doc.moveDown()
    })
  }

  private generateWaterPDF(doc: PDFDocument, data: any) {
    doc.fontSize(14).text('Water Consumption Report', { underline: true })
    doc.moveDown()

    // Summary
    doc.fontSize(12).text('Summary:', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`)
    doc.text(`Total Units: ${data.summary.totalUnits}`)
    doc.text(`Total Amount: KSh ${data.summary.totalAmount.toLocaleString()}`)
    doc.text(`Paid Units: ${data.summary.paidUnits}`)
    doc.text(`Paid Amount: KSh ${data.summary.paidAmount.toLocaleString()}`)
    doc.text(`Payment Rate: ${data.summary.paymentRate.toFixed(1)}%`)
    doc.text(`Average Units/Month: ${data.summary.averageUnitsPerMonth.toFixed(1)}`)
    doc.text(`Average Amount/Month: KSh ${data.summary.averageAmountPerMonth.toLocaleString()}`)
    doc.moveDown()

    // Monthly data
    doc.fontSize(12).text('Monthly Consumption:', { underline: true })
    doc.moveDown(0.5)

    data.monthlyData.forEach((month: any, index: number) => {
      if (index > 0 && index % 5 === 0) {
        doc.addPage()
      }
      
      doc.fontSize(10).text(`${month.month}:`, { bold: true })
      doc.text(`  Total Units: ${month.totalUnits}`)
      doc.text(`  Total Amount: KSh ${month.totalAmount.toLocaleString()}`)
      doc.text(`  Paid Units: ${month.paidUnits}`)
      doc.text(`  Paid Amount: KSh ${month.paidAmount.toLocaleString()}`)
      doc.moveDown(0.5)
    })

    // Apartment ranking
    doc.addPage()
    doc.fontSize(12).text('Apartment Consumption Ranking:', { underline: true })
    doc.moveDown(0.5)

    data.apartmentRanking.forEach((apt: any, index: number) => {
      if (index > 0 && index % 15 === 0) {
        doc.addPage()
      }
      
      doc.fontSize(10).text(`${index + 1}. ${apt.apartment}: ${apt.units} units`)
    })

    // Extremes
    doc.moveDown()
    doc.fontSize(12).text('Consumption Extremes:', { underline: true })
    doc.moveDown(0.5)
    
    if (data.extremes.highestConsumer) {
      doc.fontSize(10).text(`Highest Consumer: ${data.extremes.highestConsumer.apartment} (${data.extremes.highestConsumer.units} units)`)
    }
    
    if (data.extremes.lowestConsumer) {
      doc.text(`Lowest Consumer: ${data.extremes.lowestConsumer.apartment} (${data.extremes.lowestConsumer.units} units)`)
    }
  }

  async sendPaymentReminders(): Promise<void> {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.toISOString().slice(0, 7)

      // Find tenants with overdue payments
      const overdueTenants = await prisma.user.findMany({
        where: {
          role: 'TENANT',
          status: { in: ['OVERDUE', 'DELINQUENT'] },
          balance: { gt: 0 },
        },
      })

      // Find tenants with pending current month payments
      const tenants = await prisma.user.findMany({
        where: { role: 'TENANT' },
      })

      const tenantsWithoutCurrentMonthPayment = tenants.filter(async (tenant) => {
        const currentMonthPayment = await prisma.payment.findFirst({
          where: {
            tenantId: tenant.id,
            month: currentMonth,
            type: 'RENT',
            status: 'VERIFIED',
          },
        })
        return !currentMonthPayment
      })

      // Combine lists and remove duplicates
      const tenantsToRemind = [...overdueTenants, ...tenantsWithoutCurrentMonthPayment]
      const uniqueTenants = Array.from(
        new Map(tenantsToRemind.map(tenant => [tenant.id, tenant])).values()
      )

      // Send reminders
      for (const tenant of uniqueTenants) {
        try {
          await this.emailService.sendPaymentReminder(tenant, currentMonth)
          
          // Create notification
          await prisma.notification.create({
            data: {
              userId: tenant.id,
              title: 'Payment Reminder',
              message: `Reminder: ${currentMonth} payment of KSh ${tenant.rentAmount} is due.`,
              type: 'PAYMENT',
              relatedId: tenant.id,
              relatedType: 'TENANT',
            },
          })
        } catch (error) {
          console.error(`Failed to send reminder to ${tenant.email}:`, error)
        }
      }

      console.log(`Sent payment reminders to ${uniqueTenants.length} tenants`)
    } catch (error) {
      console.error('Error sending payment reminders:', error)
      throw error
    }
  }
}