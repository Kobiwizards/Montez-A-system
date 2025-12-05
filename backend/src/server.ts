import { createApp } from './app'
import { config } from './config'
import { PrismaClient } from '@prisma/client'
import { createServer } from 'http'
import { setupWebSocket } from './websocket'
import { AnalyticsService } from './services/analytics.service'

const prisma = new PrismaClient()
const analyticsService = new AnalyticsService(prisma)

const PORT = config.port || 3001

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    const app = createApp()
    const server = createServer(app)

    // Setup WebSocket for real-time updates
    setupWebSocket(server)

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 API Documentation: http://localhost:${PORT}/api-docs`)
      console.log(`🌍 Environment: ${config.nodeEnv}`)
      console.log(`🔗 CORS Origin: ${config.corsOrigin}`)
    })

    // Setup automated tasks
    setupAutomatedTasks()

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('🛑 Received shutdown signal')
      
      server.close(async () => {
        console.log('🔒 HTTP server closed')
        
        await prisma.$disconnect()
        console.log('🔌 Database connection closed')
        
        process.exit(0)
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏰ Forcing shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

function setupAutomatedTasks() {
  console.log('🔄 Setting up automated tasks...')
  
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
        console.log('📊 Daily analytics snapshot generated')
      } catch (error) {
        console.error('❌ Failed to generate analytics snapshot:', error)
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
        console.log('💳 Payment reminders sent')
      } catch (error) {
        console.error('❌ Failed to send payment reminders:', error)
      }
      
      // Schedule next month
      schedulePaymentReminders()
    }, delay)
  }
  
  scheduleAnalyticsSnapshot()
  schedulePaymentReminders()
}

startServer()