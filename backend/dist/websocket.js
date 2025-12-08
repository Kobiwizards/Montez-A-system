"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.getWebSocketFunctions = getWebSocketFunctions;
exports.notifyPaymentCreated = notifyPaymentCreated;
exports.notifyPaymentVerified = notifyPaymentVerified;
exports.notifyMaintenanceCreated = notifyMaintenanceCreated;
exports.notifyMaintenanceUpdated = notifyMaintenanceUpdated;
exports.notifyNotificationCreated = notifyNotificationCreated;
exports.sendSystemAlert = sendSystemAlert;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
let webSocketFunctions = null;
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    const clients = new Map();
    function sendToClient(userId, message) {
        const client = clients.get(userId);
        if (client && client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    function broadcastToRole(role, message) {
        clients.forEach((client) => {
            if (client.role === role && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
    function broadcastToAll(message) {
        clients.forEach((client) => {
            if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
    function notifyPaymentCreated(payment) {
        // Notify admin
        broadcastToRole('ADMIN', {
            type: 'payment_created',
            data: payment,
        });
        // Notify the specific tenant
        sendToClient(payment.tenantId, {
            type: 'payment_submitted',
            data: payment,
        });
    }
    function notifyPaymentVerified(payment) {
        // Notify the tenant
        sendToClient(payment.tenantId, {
            type: 'payment_verified',
            data: payment,
        });
    }
    function notifyMaintenanceCreated(request) {
        // Notify admin
        broadcastToRole('ADMIN', {
            type: 'maintenance_created',
            data: request,
        });
    }
    function notifyMaintenanceUpdated(request) {
        // Notify the tenant
        sendToClient(request.tenantId, {
            type: 'maintenance_updated',
            data: request,
        });
    }
    function notifyNotificationCreated(notification) {
        // Notify the specific user
        sendToClient(notification.userId, {
            type: 'notification_created',
            data: notification,
        });
    }
    function sendSystemAlert(message, type = 'info') {
        broadcastToAll({
            type: 'system_alert',
            data: { message, type, timestamp: new Date().toISOString() },
        });
    }
    wss.on('connection', async (ws, request) => {
        try {
            // Extract token from query string
            const url = new URL(request.url || '', `http://${request.headers.host}`);
            const token = url.searchParams.get('token');
            if (!token) {
                ws.close(1008, 'Authentication required');
                return;
            }
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            // Store client connection
            const client = {
                ws,
                userId: decoded.id,
                role: decoded.role,
                apartment: decoded.apartment,
            };
            clients.set(decoded.id, client);
            console.log(`Client connected: ${decoded.email} (${decoded.role})`);
            // Send welcome message
            sendToClient(decoded.id, {
                type: 'connected',
                data: { message: 'Connected to real-time updates' },
            });
            // Handle messages from client
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    await handleMessage(client, message);
                }
                catch (error) {
                    console.error('Error handling message:', error);
                }
            });
            // Handle disconnection
            ws.on('close', () => {
                clients.delete(decoded.id);
                console.log(`Client disconnected: ${decoded.email}`);
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                clients.delete(decoded.id);
            });
        }
        catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(1008, 'Authentication failed');
        }
    });
    async function handleMessage(client, message) {
        switch (message.type) {
            case 'ping':
                sendToClient(client.userId, { type: 'pong', data: { timestamp: Date.now() } });
                break;
            case 'subscribe':
                // Handle subscription requests
                break;
            default:
                console.log('Unknown message type:', message.type);
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
    };
    return webSocketFunctions;
}
// Export individual functions that can be used elsewhere
function getWebSocketFunctions() {
    return webSocketFunctions;
}
// Convenience functions that use the stored functions
function notifyPaymentCreated(payment) {
    if (webSocketFunctions) {
        webSocketFunctions.notifyPaymentCreated(payment);
    }
}
function notifyPaymentVerified(payment) {
    if (webSocketFunctions) {
        webSocketFunctions.notifyPaymentVerified(payment);
    }
}
function notifyMaintenanceCreated(request) {
    if (webSocketFunctions) {
        webSocketFunctions.notifyMaintenanceCreated(request);
    }
}
function notifyMaintenanceUpdated(request) {
    if (webSocketFunctions) {
        webSocketFunctions.notifyMaintenanceUpdated(request);
    }
}
function notifyNotificationCreated(notification) {
    if (webSocketFunctions) {
        webSocketFunctions.notifyNotificationCreated(notification);
    }
}
function sendSystemAlert(message, type = 'info') {
    if (webSocketFunctions) {
        webSocketFunctions.sendSystemAlert(message, type);
    }
}
