import { createApp } from './app'
import { config } from './config'
import { PrismaClient } from '@prisma/client'
import { createServer } from 'http'
import { setupWebSocket } from './websocket'
import { AnalyticsService } from './services/analytics.service'

const prisma = new PrismaClient()
const analyticsService = new AnalyticsService()

const PORT = config.port || 3001

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('‚úÖ Database connected successfully')

    const app = createApp()
    const server = createServer(app)

    // Setup WebSocket for real-time updates
    setupWebSocket(server)

    server.listen(PORT, () => {
      console.log(`Ì∫Ä Server running on port ${PORT}`)
      console.log(`Ì≥ä API Documentation: http://localhost:${PORT}/api-docs`)
      console.log(`Ìºç Environment: ${config.nodeEnv}`)
      console.log(`Ì¥ó CORS Origin: ${config.corsOrigins[0]}`)
    })

    // Setup automated tasks
    setupAutomatedTasks()

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Ìªë Received shutdown signal')
      
      server.close(async () => {
        console.log('Ì¥í HTTP server closed')
        
        await prisma.$disconnect()
        console.log('Ì¥å Database connection closed')
        
        process.exit(0)
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('‚è∞ Forcing shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

  } catch (error) {
    console.error('‚ùå Failed to start server:', error)
    process.exit(1)
  }
}

function setupAutomatedTasks() {
  console.log('Ì¥Ñ Setting up automated tasks...')
  
  // Daily analytics snapshot at 1 AM
  const scheduleAnalyticsSnapshot = () => {
    const now = new Date()
    const target = new Date(now)
    target.setHours(1, 0, 0, 0)
    
    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }
    
    const delay = target.getTime() - now.getTime()
    
    setTimeout(async () => {
      try {
        await analyticsService.generateDailySnapshot()
        console.log('Ì≥ä Daily analytics snapshot generated')
      } catch (error) {
        console.error('‚ùå Failed to generate analytics snapshot:', error)
      }
      
      // Schedule next day
      scheduleAnalyticsSnapshot()
    }, delay)
  }
  
  // Send payment reminders on 25th of each month at 9 AM
  const schedulePaymentReminders = () => {
    const now = new Date()
    const target = new Date(now)
    
    if (now.getDate() >= 25) {
      target.setMonth(target.getMonth() + 1)
    }
    target.setDate(25)
    target.setHours(9, 0, 0, 0)
    
    const delay = target.getTime() - now.getTime()
    
    setTimeout(async () => {
      try {
        await analyticsService.sendPaymentReminders()
        console.log('Ì≤≥ Payment reminders sent')
      } catch (error) {
        console.error('‚ùå Failed to send payment reminders:', error)
      }
      
      // Schedule next month
      schedulePaymentReminders()
    }, delay)
  }
  
  scheduleAnalyticsSnapshot()
  schedulePaymentReminders()
}

startServer()
