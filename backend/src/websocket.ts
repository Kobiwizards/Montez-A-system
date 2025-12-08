import { Server } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import { config } from './config'
import { prisma } from './lib/prisma'

interface Client {
  ws: WebSocket
  userId: string
  role: string
  apartment?: string
}

interface Message {
  type: string
  data: any
}

interface WebSocketFunctions {
  sendToClient: (userId: string, message: Message) => void
  broadcastToRole: (role: string, message: Message) => void
  broadcastToAll: (message: Message) => void
  notifyPaymentCreated: (payment: any) => void
  notifyPaymentVerified: (payment: any) => void
  notifyMaintenanceCreated: (request: any) => void
  notifyMaintenanceUpdated: (request: any) => void
  notifyNotificationCreated: (notification: any) => void
  sendSystemAlert: (message: string, type?: 'info' | 'warning' | 'error') => void
}

let webSocketFunctions: WebSocketFunctions | null = null

export function setupWebSocket(server: Server): WebSocketFunctions {
  const wss = new WebSocketServer({ server })
  const clients = new Map<string, Client>()

  function sendToClient(userId: string, message: Message) {
    const client = clients.get(userId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  function broadcastToRole(role: string, message: Message) {
    clients.forEach((client) => {
      if (client.role === role && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
  }

  function broadcastToAll(message: Message) {
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
  }

  function notifyPaymentCreated(payment: any) {
    // Notify admin
    broadcastToRole('ADMIN', {
      type: 'payment_created',
      data: payment,
    })

    // Notify the specific tenant
    sendToClient(payment.tenantId, {
      type: 'payment_submitted',
      data: payment,
    })
  }

  function notifyPaymentVerified(payment: any) {
    // Notify the tenant
    sendToClient(payment.tenantId, {
      type: 'payment_verified',
      data: payment,
    })
  }

  function notifyMaintenanceCreated(request: any) {
    // Notify admin
    broadcastToRole('ADMIN', {
      type: 'maintenance_created',
      data: request,
    })
  }

  function notifyMaintenanceUpdated(request: any) {
    // Notify the tenant
    sendToClient(request.tenantId, {
      type: 'maintenance_updated',
      data: request,
    })
  }

  function notifyNotificationCreated(notification: any) {
    // Notify the specific user
    sendToClient(notification.userId, {
      type: 'notification_created',
      data: notification,
    })
  }

  function sendSystemAlert(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    broadcastToAll({
      type: 'system_alert',
      data: { message, type, timestamp: new Date().toISOString() },
    })
  }

  wss.on('connection', async (ws: WebSocket, request) => {
    try {
      // Extract token from query string
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const token = url.searchParams.get('token')

      if (!token) {
        ws.close(1008, 'Authentication required')
        return
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string
        email: string
        role: string
        apartment?: string
      }

      // Store client connection
      const client: Client = {
        ws,
        userId: decoded.id,
        role: decoded.role,
        apartment: decoded.apartment,
      }

      clients.set(decoded.id, client)

      console.log(`Client connected: ${decoded.email} (${decoded.role})`)

      // Send welcome message
      sendToClient(decoded.id, {
        type: 'connected',
        data: { message: 'Connected to real-time updates' },
      })

      // Handle messages from client
      ws.on('message', async (data: Buffer) => {
        try {
          const message: Message = JSON.parse(data.toString())
          await handleMessage(client, message)
        } catch (error) {
          console.error('Error handling message:', error)
        }
      })

      // Handle disconnection
      ws.on('close', () => {
        clients.delete(decoded.id)
        console.log(`Client disconnected: ${decoded.email}`)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        clients.delete(decoded.id)
      })

    } catch (error) {
      console.error('WebSocket connection error:', error)
      ws.close(1008, 'Authentication failed')
    }
  })

  async function handleMessage(client: Client, message: Message) {
    switch (message.type) {
      case 'ping':
        sendToClient(client.userId, { type: 'pong', data: { timestamp: Date.now() } })
        break

      case 'subscribe':
        // Handle subscription requests
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }

  // Store functions globally so they can be accessed from other files
  webSocketFunctions = {
    sendToClient,
    broadcastToRole,
    broadcastToAll,
    notifyPaymentCreated,
    notifyPaymentVerified,
    notifyMaintenanceCreated,
    notifyMaintenanceUpdated,
    notifyNotificationCreated,
    sendSystemAlert,
  }

  return webSocketFunctions
}

// Export individual functions that can be used elsewhere
export function getWebSocketFunctions(): WebSocketFunctions | null {
  return webSocketFunctions
}

// Convenience functions that use the stored functions
export function notifyPaymentCreated(payment: any) {
  if (webSocketFunctions) {
    webSocketFunctions.notifyPaymentCreated(payment)
  }
}

export function notifyPaymentVerified(payment: any) {
  if (webSocketFunctions) {
    webSocketFunctions.notifyPaymentVerified(payment)
  }
}

export function notifyMaintenanceCreated(request: any) {
  if (webSocketFunctions) {
    webSocketFunctions.notifyMaintenanceCreated(request)
  }
}

export function notifyMaintenanceUpdated(request: any) {
  if (webSocketFunctions) {
    webSocketFunctions.notifyMaintenanceUpdated(request)
  }
}

export function notifyNotificationCreated(notification: any) {
  if (webSocketFunctions) {
    webSocketFunctions.notifyNotificationCreated(notification)
  }
}

export function sendSystemAlert(message: string, type: 'info' | 'warning' | 'error' = 'info') {
  if (webSocketFunctions) {
    webSocketFunctions.sendSystemAlert(message, type)
  }
}