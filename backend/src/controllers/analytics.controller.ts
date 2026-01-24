import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { AuthenticatedRequest } from '../types'
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AnalyticsService } from '../services/analytics.service'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export class AnalyticsController {
  private analyticsService: AnalyticsService

  constructor() {
    this.analyticsService = new AnalyticsService()
  }

  getDashboardMetrics = async (_: Request, res: Response): Promise<void> => {
    try {
      const currentDate = new Date()
      const totalUnits = 26

      // Get occupancy metrics
      const tenants = await prisma.user.findMany({
        where: {
          role: 'TENANT',
          status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] },
        },
      })

      const occupiedUnits = tenants.length
      const vacantUnits = totalUnits - occupiedUnits
      const occupancyRate = (occupiedUnits / totalUnits) * 100

      // Get financial metrics for current month
      const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM

      const [payments, waterReadings] = await Promise.all([
        prisma.payment.findMany({
          where: {
            month: currentMonth,
            status: 'VERIFIED',
          },
        }),
        prisma.waterReading.findMany({
          where: {
            month: currentMonth,
            paid: true,
          },
        }),
      ])

      const totalRentPaid = payments
        .filter(p => p.type === 'RENT')
        .reduce((sum, p) => sum + p.amount, 0)

      const totalWaterPaid = waterReadings.reduce((sum, r) => sum + r.amount, 0)

      const totalOtherPaid = payments
        .filter(p => p.type === 'OTHER' || p.type === 'MAINTENANCE')
        .reduce((sum, p) => sum + p.amount, 0)

      const totalCollected = totalRentPaid + totalWaterPaid + totalOtherPaid

      // Get expected amounts
      const totalExpectedRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0)
      const totalExpectedWater = waterReadings.reduce((sum, r) => sum + r.amount, 0)

      const collectionRate = totalExpectedRent > 0 
        ? (totalRentPaid / totalExpectedRent) * 100 
        : 0

      // Get pending payments
      const pendingPayments = await prisma.payment.count({
        where: { status: 'PENDING' },
      })

      // Get tenant status counts
      const currentTenants = tenants.filter(t => t.status === 'CURRENT').length
      const overdueTenants = tenants.filter(t => t.status === 'OVERDUE').length
      const delinquentTenants = tenants.filter(t => t.status === 'DELINQUENT').length

      // Get maintenance requests
      const activeMaintenanceRequests = await prisma.maintenanceRequest.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      })

      // Get recent payments
      const recentPayments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: subMonths(currentDate, 1),
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          tenant: {
            select: {
              name: true,
              apartment: true,
            },
          },
        },
      })

      // Get monthly trends (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date.toISOString().slice(0, 7)
      }).reverse()

      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const [monthPayments, monthWater] = await Promise.all([
            prisma.payment.findMany({
              where: {
                month,
                status: 'VERIFIED',
                type: 'RENT',
              },
            }),
            prisma.waterReading.findMany({
              where: {
                month,
                paid: true,
              },
            }),
          ])

          const rentCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0)
          const waterCollected = monthWater.reduce((sum, r) => sum + r.amount, 0)

          // Get occupancy for this month
          const monthTenants = await prisma.user.findMany({
            where: {
              role: 'TENANT',
              OR: [
                { moveInDate: { lte: endOfMonth(new Date(`${month}-01`)) } },
              ],
              AND: [
                { 
                  OR: [
                    { leaseEndDate: { gte: startOfMonth(new Date(`${month}-01`)) } },
                    { leaseEndDate: null },
                  ],
                },
                { status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] } },
              ],
            },
          })

          const monthOccupancyRate = (monthTenants.length / totalUnits) * 100

          return {
            month,
            rentCollected,
            waterCollected,
            totalCollected: rentCollected + waterCollected,
            occupancyRate: monthOccupancyRate,
            tenantCount: monthTenants.length,
          }
        })
      )

      const dashboardData = {
        occupancy: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate,
        },
        financial: {
          currentMonth: {
            rentCollected: totalRentPaid,
            waterCollected: totalWaterPaid,
            otherCollected: totalOtherPaid,
            totalCollected,
            expectedRent: totalExpectedRent,
            expectedWater: totalExpectedWater,
            collectionRate,
          },
          monthlyTrends: monthlyData,
        },
        payments: {
          pending: pendingPayments,
          recent: recentPayments,
        },
        tenants: {
          total: tenants.length,
          current: currentTenants,
          overdue: overdueTenants,
          delinquent: delinquentTenants,
        },
        maintenance: {
          active: activeMaintenanceRequests,
        },
        overview: {
          totalOutstanding: tenants.reduce((sum, t) => sum + t.balance, 0),
          averageRent: tenants.length > 0 
            ? tenants.reduce((sum, t) => sum + t.rentAmount, 0) / tenants.length 
            : 0,
          averageWaterConsumption: waterReadings.length > 0
            ? waterReadings.reduce((sum, r) => sum + r.units, 0) / waterReadings.length
            : 0,
        },
      }

      res.status(200).json({
        success: true,
        data: dashboardData,
      })
    } catch (error) {
      console.error('Get dashboard metrics error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getFinancialReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, period = 'month' } = req.query

      const report = await this.analyticsService.generateFinancialReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        period: period as 'day' | 'week' | 'month' | 'year',
      })

      res.status(200).json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Get financial report error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getOccupancyReport = async (_: Request, res: Response): Promise<void> => {
    try {
      const report = await this.analyticsService.generateOccupancyReport()

      res.status(200).json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Get occupancy report error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantReport = async (_: Request, res: Response): Promise<void> => {
    try {
      const report = await this.analyticsService.generateTenantReport()

      res.status(200).json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Get tenant report error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getWaterConsumptionReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query

      const report = await this.analyticsService.generateWaterConsumptionReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      })

      res.status(200).json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Get water consumption report error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  exportReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type: returnType, format = 'json', ...params } = req.query

      let report: any

      switch (returnType) {
        case 'financial':
          report = await this.analyticsService.generateFinancialReport(params)
          break
        case 'occupancy':
          report = await this.analyticsService.generateOccupancyReport()
          break
        case 'tenant':
          report = await this.analyticsService.generateTenantReport()
          break
        case 'water':
          report = await this.analyticsService.generateWaterConsumptionReport(params)
          break
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid report type',
          })
          return
      }

      if (format === 'csv') {
        const csv = this.analyticsService.convertToCSV(report)
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=${returnType}-report-${Date.now()}.csv`)
        
        res.send(csv)
        return
      }

      if (format === 'pdf') {
        const pdfBuffer = await this.analyticsService.generatePDFReport(report, returnType as string)
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${returnType}-report-${Date.now()}.pdf`)
        
        res.send(pdfBuffer)
        return
      }

      // Default to JSON
      res.status(200).json({
        success: true,
        data: report,
      })
    } catch (error) {
      console.error('Export report error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
