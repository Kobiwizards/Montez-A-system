import WebSocket, { WebSocketServer, RawData } from 'ws'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

interface WebSocketMessage {
  type: string
  data: any
  userId?: string
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  userRole?: string
}

export class WebSocketService {
  private wss: WebSocketServer
  private clients: Map<string, AuthenticatedWebSocket> = new Map()
  private prisma: PrismaClient

  constructor(server: any) {
    this.wss = new WebSocketServer({ server })
    this.prisma = new PrismaClient()
    this.setupWebSocket()
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: any) => {
      console.log('Ì¥å New WebSocket connection')

      // Extract token from query parameters
      const url = request.url ? new URL(request.url, `http://${request.headers.host}`) : null
      const token = url ? url.searchParams.get('token') : null

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
          ws.userId = decoded.userId
          ws.userRole = decoded.role

          if (ws.userId) {
            this.clients.set(ws.userId, ws)
            console.log(`‚úÖ WebSocket authenticated for user: ${ws.userId}`)
          }
        } catch (error: any) {
          console.log('‚ùå WebSocket authentication failed:', error.message);
          ws.close(1008, 'Authentication failed')
          return
        }
      }

      ws.on('message', (data: RawData) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error: any) {
          console.error('‚ùå Error parsing WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        if (ws.userId) {
          this.clients.delete(ws.userId)
          console.log(`Ì¥å WebSocket disconnected for user: ${ws.userId}`)
        }
      })

      ws.on('error', (error: any) => {
        console.error('‚ùå WebSocket error:', error)
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        data: { message: 'Connected to Montez A WebSocket', timestamp: new Date().toISOString() }
      }))
    })
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', data: { timestamp: new Date().toISOString() } }))   
        break

      case 'subscribe':
        // Handle subscription requests
        this.handleSubscription(ws, message.data)
        break

      case 'unsubscribe':
        // Handle unsubscription requests
        break

      default:
        console.log('Ì≥® Unknown message type:', message.type)
    }
  }

  private handleSubscription(ws: AuthenticatedWebSocket, data: any): void {
    // Implement subscription logic based on user role and requested channels
    const channels = data.channels || []
    console.log(`Ì≥° User ${ws.userId} subscribed to channels:`, channels)
  }

  public sendToUser(userId: string, message: WebSocketMessage): void {
    const client = this.clients.get(userId)
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  }

  public sendToRole(role: string, message: WebSocketMessage): void {
    this.clients.forEach((client) => {
      if (client.userRole === role && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  public broadcast(message: WebSocketMessage): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  public async sendPaymentNotification(paymentId: string): Promise<void> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { tenant: true }
      })

      if (payment && payment.tenantId) {
        this.sendToUser(payment.tenantId, {
          type: 'payment_update',
          data: {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            month: payment.month
          }
        })
      }
    } catch (error: any) {
      console.error('‚ùå Error sending payment notification:', error)
    }
  }

  public async sendMaintenanceUpdate(requestId: string): Promise<void> {
    try {
      const request = await this.prisma.maintenanceRequest.findUnique({
        where: { id: requestId },
        include: { tenant: true }
      })

      if (request && request.tenantId) {
        this.sendToUser(request.tenantId, {
          type: 'maintenance_update',
          data: {
            requestId: request.id,
            status: request.status,
            title: request.title
          }
        })
      }
    } catch (error: any) {
      console.error('‚ùå Error sending maintenance update:', error)
    }
  }

  public getConnectedUsers(): number {
    return this.clients.size
  }

  public cleanup(): void {
    this.wss.close()
    this.prisma.$disconnect()
  }
}
