export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    relatedId?: string;
    relatedType?: string;
    createdAt: Date;
}
export interface NotificationWithUser extends Notification {
    user: {
        id: string;
        name: string;
        email: string;
        apartment: string;
    };
}
export interface NotificationStats {
    total: number;
    unread: number;
    byType: {
        PAYMENT: number;
        MAINTENANCE: number;
        SYSTEM: number;
        ALERT: number;
    };
}
//# sourceMappingURL=notification.types.d.ts.map