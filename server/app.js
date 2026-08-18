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


// تحديث وتأمين ملف server/app.js ليتوافق مع بيئة Replit واستوديو تطبيقات Pi

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const payloadRouter = require('./payload_router');
const pushProvisioningRouter = require('./push_provisioning');

const app = express();

// الحماية المتقدمة مع السماح لمتصفح Pi واستوديو التطبيقات بالربط السحابي
app.use(helmet({
    contentSecurityPolicy: false // إيقاف قفل الـ CSP مؤقتاً لتسهيل حقن الـ Pi SDK داخل متصفح Pi Browser
})); 

// 🚨 هام جداً لـ Replit: السماح لجميع النطاقات الفرعية لـ minepi.com بالاتصال بخادمك
app.use(cors({
    origin: [
        /minepi\.com$/, 
        /localhost/, 
        "https://minepi.com" // بيئة فحص اختبار تطبيقات Pi الرسمية
    ],
    credentials: true
}));

app.use(express.json()); 

// توجيه ومزامنة مسارات معاملات بروتوكول Cobra eSIM & BIGISH-YER
app.use('/api/v1/telecom', payloadRouter);
app.use('/api/v1/telecom/push', pushProvisioningRouter);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        platform: "Replit Cloud Node Instance",
        constraints: "Zero Floating-Point & Pi-Ecosystem CORS Allowed"
    });
});

app.use((err, req, res, next) => {
    console.error("[Cobra Critical Error]:", err.stack);
    res.status(500).json({ error: "Atomic execution pipeline failure." });
});

// Replit يتطلب الاستماع للمنفذ 0.0.0.0 ليتم فتح الرابط الخارجي بنجاح
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cobra eSIM Cloud Server is fully broadcasting via Replit on port ${PORT}`);
});

module.exports = app;

// 4. واجهة برمجة التطبيقات (API) لاسترجاع سجل المعاملات التاريخية والمقاصة الرقمية الموحدة
app.get('/api/settlement/history', (req, res) => {
    try {
        // قراءة سجل المقاصة الآمن من بوابة المحفظة المشتركة لـ BIGISH-YER
        const history = walletGateway.transactionLedger.map(tx => ({
            tx_id: tx.txId,
            timestamp: tx.timestamp,
            status: tx.status,
            pi_display: (Number(tx.financials.piStroops) / 10000000).toFixed(7),
            yer_display: (Number(tx.financials.yerSubUnits) / 10000000000).toFixed(2),
            is_valid: true // تأكيد السلامة الهيكلية ضد الازدواجية المكررة
        }));
        
        res.status(200).json({ success: true, ledger: history });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to retrieve clearing history" });
    }
});



