const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// استيراد مسار معالجة وحقن حزم البيانات السيادية (Payload Router)
const payloadRouter = require('./payload_router');

const app = express();

// 1. برمجيات الحماية المتقدمة لبيئة الخادم المغلقة
app.use(helmet()); // حماية الرؤوس وتأمين الاتصال
app.use(cors());   // إدارة السماح بالاتصال من متصفح Pi Browser أو تطبيق الأندرويد
app.use(express.json()); // معالجة أجسام الطلبات بصيغة JSON القياسية

// 2. توجيه مسارات معاملات مشروع Cobra eSIM
app.use('/api/v1/telecom', payloadRouter);

// 3. نقطة فحص الحالة الصحية للخادم والربط مع بيئة التشغيل المحلية
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        protocol: "Cobra-eSIM & BIGISH-YER Gateway",
        timestamp: Date.now(),
        constraints: "Zero Floating-Point Enabled"
    });
});

// إدارة الأخطاء العامة لضمان عدم انهيار الخادم أثناء الفحص بالثانية الواحدة
app.use((err, req, res, next) => {
    console.error("[Cobra Critical Error]:", err.stack);
    res.status(500).json({ error: "Atomic execution pipeline failure. Safe state preserved." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🐍 Cobra eSIM Secure Infrastructure Node is Active`);
    console.log(`📡 Local Port: http://localhost:${PORT}`);
    console.log(`🔒 Environment: PRIVATE CLOSED SOURCE`);
    console.log(`==================================================`);
});

module.exports = app;
