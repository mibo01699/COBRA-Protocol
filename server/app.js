const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// استيراد المسارات التأسيسية لبروتوكول المقاصة والتثبيت التلقائي دون تدخل بشري
const payloadRouter = require('./payload_router');
const pushProvisioningRouter = require('./push_provisioning');

const app = express();

// 1. برمجيات الحماية لبيئة الخادم المغلقة والمشفرة محلياً
app.use(helmet()); 
app.use(cors());   
app.use(express.json()); 

// 2. توجيه ومزامنة مسارات معاملات بروتوكول Cobra eSIM & BIGISH-YER
app.use('/api/v1/telecom', payloadRouter);
app.use('/api/v1/telecom/push', pushProvisioningRouter); // المسار الجديد للتنشيط التلقائي بنقرة واحدة

// 3. نقطة فحص الحالة الصحية للعقد البرمجي المحلي
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        protocol: "Cobra-eSIM & BIGISH-YER Gateway",
        timestamp: Date.now(),
        constraints: "Zero Floating-Point & Zero-Touch Push Active"
    });
});

// إدارة ومعالجة الأخطاء الطارئة لحماية سلامة الأصول المالية في المحافظ
app.use((err, req, res, next) => {
    console.error("[Cobra Critical Error]:", err.stack);
    res.status(500).json({ error: "Atomic execution pipeline failure. Safe state preserved." });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🐍 Cobra eSIM Secure Infrastructure Node is Active`);
    console.log(`📡 Local Port: http://localhost:${PORT}`);
    console.log(`🔒 Environment: PRIVATE CLOSED SOURCE (BIGISH-YER Mapped)`);
    console.log(`==================================================`);
});

module.exports = app;
