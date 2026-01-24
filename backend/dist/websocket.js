"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = __importStar(require("ws"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
class WebSocketService {
    wss;
    clients = new Map();
    prisma;
    constructor(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.prisma = new client_1.PrismaClient();
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws, request) => {
            console.log('��� New WebSocket connection');
            // Extract token from query parameters
            const url = request.url ? new URL(request.url, `http://${request.headers.host}`) : null;
            const token = url ? url.searchParams.get('token') : null;
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    ws.userId = decoded.userId;
                    ws.userRole = decoded.role;
                    if (ws.userId) {
                        this.clients.set(ws.userId, ws);
                        console.log(`✅ WebSocket authenticated for user: ${ws.userId}`);
                    }
                }
                catch (error) {
                    console.log('❌ WebSocket authentication failed:', error.message);
                    ws.close(1008, 'Authentication failed');
                    return;
                }
            }
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                if (ws.userId) {
                    this.clients.delete(ws.userId);
                    console.log(`��� WebSocket disconnected for user: ${ws.userId}`);
                }
            });
            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
            });
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'welcome',
                data: { message: 'Connected to Montez A WebSocket', timestamp: new Date().toISOString() }
            }));
        });
    }
    handleMessage(ws, message) {
        switch (message.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', data: { timestamp: new Date().toISOString() } }));
                break;
            case 'subscribe':
                // Handle subscription requests
                this.handleSubscription(ws, message.data);
                break;
            case 'unsubscribe':
                // Handle unsubscription requests
                break;
            default:
                console.log('��� Unknown message type:', message.type);
        }
    }
    handleSubscription(ws, data) {
        // Implement subscription logic based on user role and requested channels
        const channels = data.channels || [];
        console.log(`��� User ${ws.userId} subscribed to channels:`, channels);
    }
    sendToUser(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
    sendToRole(role, message) {
        this.clients.forEach((client) => {
            if (client.userRole === role && client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    broadcast(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    async sendPaymentNotification(paymentId) {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { id: paymentId },
                include: { tenant: true }
            });
            if (payment && payment.tenantId) {
                this.sendToUser(payment.tenantId, {
                    type: 'payment_update',
                    data: {
                        paymentId: payment.id,
                        status: payment.status,
                        amount: payment.amount,
                        month: payment.month
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error sending payment notification:', error);
        }
    }
    async sendMaintenanceUpdate(requestId) {
        try {
            const request = await this.prisma.maintenanceRequest.findUnique({
                where: { id: requestId },
                include: { tenant: true }
            });
            if (request && request.tenantId) {
                this.sendToUser(request.tenantId, {
                    type: 'maintenance_update',
                    data: {
                        requestId: request.id,
                        status: request.status,
                        title: request.title
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error sending maintenance update:', error);
        }
    }
    getConnectedUsers() {
        return this.clients.size;
    }
    cleanup() {
        this.wss.close();
        this.prisma.$disconnect();
    }
}
exports.WebSocketService = WebSocketService;
