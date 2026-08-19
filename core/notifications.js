/**
 * COBRA Protocol - Internal System Notifications
 * منظومة Arabian Eagle Ecosystem (A.E.C.) - إدارة الإشارات والتحذيرات الداخلية
 */

class CobraNotificationSystem {
    constructor() {
        this.logs = [];
    }

    // بث إشعار داخلي للنظام
    broadcast(level, message) {
        const timestamp = new Date().toISOString();
        const notification = {
            id: `NOTIFY-${Math.floor(Math.random() * 90000) + 10000}`,
            timestamp,
            level: level.toUpperCase(), // INFO, WARNING, CRITICAL
            message
        };

        this.logs.push(notification);
        console.log(`[🔔 AEC-NOTIFICATION] [${notification.level}] [${timestamp}] -> ${message}`);
        return notification;
    }

    getRecentNotifications() {
        return this.logs.slice(-10).reverse();
    }
}

module.exports = new CobraNotificationSystem();
