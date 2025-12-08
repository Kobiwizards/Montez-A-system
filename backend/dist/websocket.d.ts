import { Server } from 'http';
interface Message {
    type: string;
    data: any;
}
interface WebSocketFunctions {
    sendToClient: (userId: string, message: Message) => void;
    broadcastToRole: (role: string, message: Message) => void;
    broadcastToAll: (message: Message) => void;
    notifyPaymentCreated: (payment: any) => void;
    notifyPaymentVerified: (payment: any) => void;
    notifyMaintenanceCreated: (request: any) => void;
    notifyMaintenanceUpdated: (request: any) => void;
    notifyNotificationCreated: (notification: any) => void;
    sendSystemAlert: (message: string, type?: 'info' | 'warning' | 'error') => void;
}
export declare function setupWebSocket(server: Server): WebSocketFunctions;
export declare function getWebSocketFunctions(): WebSocketFunctions | null;
export declare function notifyPaymentCreated(payment: any): void;
export declare function notifyPaymentVerified(payment: any): void;
export declare function notifyMaintenanceCreated(request: any): void;
export declare function notifyMaintenanceUpdated(request: any): void;
export declare function notifyNotificationCreated(notification: any): void;
export declare function sendSystemAlert(message: string, type?: 'info' | 'warning' | 'error'): void;
export {};
//# sourceMappingURL=websocket.d.ts.map