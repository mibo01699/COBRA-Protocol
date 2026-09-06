/**
 * COBRA Protocol — بروتوكول الاتصالات المرنة للطوارئ
 * Crisis-resilient multi-path connectivity infrastructure
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================
// 1. الأمان والوسائط (Middleware)
// ============================================================

// حماية رؤوس HTTP
app.use(helmet());

// تحديد معدل الطلبات (100 طلب لكل 15 دقيقة)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS
app.use(cors());

// معالجة JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم الملفات الثابتة (إذا وجدت)
app.use(express.static(path.join(__dirname, 'pi-dapp-frontend')));

// ============================================================
// 2. نقاط النهاية (Endpoints)
// ============================================================

// نقطة التحقق من صحة التطبيق (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'COBRA-Protocol'
  });
});

// نقطة جلب معلومات التطبيق (للبوابة)
app.get('/api/apps', (req, res) => {
  res.status(200).json({
    id: 'cobra',
    name: 'COBRA Protocol',
    description: 'اتصالات الطوارئ والشبكات المرنة (eSIM، Mesh، Satellite)',
    version: '1.0.0',
    status: 'ONLINE',
    endpoints: {
      health: '/api/health',
      info: '/api/apps',
      status: '/api/status'
    }
  });
});

// نقطة الحالة العامة
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString()
  });
});

// نقطة جذرية (ترحيب)
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🦅 COBRA Protocol API is running',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/apps', '/api/status']
  });
});

// ============================================================
// 3. معالجة الأخطاء (Error Handling)
// ============================================================

// معالج المسارات غير الموجودة (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// معالج الأخطاء العام (500)
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// 4. التصدير والتشغيل
// ============================================================

module.exports = app;

// تشغيل الخادم محلياً
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 COBRA Protocol running on port ${PORT}`);
    console.log(`📋 Endpoints: /api/health, /api/apps, /api/status`);
  });
}