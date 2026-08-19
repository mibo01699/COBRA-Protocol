/**
 * COBRA Protocol - Main Core Server
 * منظومة Arabian Eagle Ecosystem (A.E.C.) - ربط نظام الإشعارات الداخلي
 */

const express = require('express');
const path = require('path');
const notifications = require('../core/notifications'); // استدعاء وحدة الإشعارات

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// بث إشعار أوتوماتيكي عند إقلاع السيرفر وتأكيد بيئة المحاكاة الآمنة
app.listen(PORT, () => {
    notifications.broadcast('INFO', `تم بدء تشغيل نواة بروتوكول COBRA بنجاح على المنفذ ${PORT}`);
    notifications.broadcast('INFO', 'بروتوكول COBRA يعمل الآن بالكامل تحت وضع المحاكاة الآمن (Simulation Mode).');
});

// مسار محاكاة الطوارئ لتجربة بث الإشعارات الحية لقنوات الـ Failover
app.post('/api/simulate-failover', (req, res) => {
    const { networkType } = req.body;
    const alertMessage = `تنبيه: تم رصد هبوط في الإشارة، جاري تفعيل التحول التلقائي الاستباقي إلى ${networkType || 'WIFI_MESH'}`;
    
    const log = notifications.broadcast('WARNING', alertMessage);
    res.json({ success: true, notification: log });
});

// عرض قائمة الإشعارات الأخيرة للنظام عبر منفذ محلي معزول
app.get('/api/internal-logs', (req, res) => {
    res.json(notifications.getRecentNotifications());
});
