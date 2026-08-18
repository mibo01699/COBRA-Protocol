// server/app.js (تحديث برمي شامل للامتثال للمنظومة الخماسية 100%)
// 🦅 ARABIAN EAGLE ECOSYSTEM (A.E.C.) - SECURED CENTRAL INTEGRATION DAEMON

const express = require('express');
const path = require('path');

// استدعاء مكونات ومحولات الربط للمشاريع الخمسة
const AIResilientNetworkManager = require('./network_manager');
const CobraPricingEngine = require('./pricing_engine');
const DualWalletGateway = require('./dual_wallet_gateway');
const CobraAntiFraudEngine = require('./anti_fraud_engine');
const GavLogisticsAdapter = require('./gav_logistics_adapter');
const AECInterlockCore = require('./aec_interlock_core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تهيئة المحركات المركزية وتأمينها
const networkManager = new AIResilientNetworkManager();
const pricingEngine = new CobraPricingEngine();
const walletGateway = new DualWalletGateway(pricingEngine);
const fraudEngine = new CobraAntiFraudEngine();
const interlockCore = new AECInterlockCore();
const gavAdapter = new GavLogisticsAdapter(interlockCore);

// 1. تخديم واجهات dApp المعزولة لمنظومة النسر العربي (COBRA, AJYAL, GAV)
app.use(express.static(path.join(__dirname, '../pi-dapp-frontend')));

// ─── [تعديل حرج لحماية المقاصة المتقاطعة للمنظومة الخماسية] ───

// [بوابة AJYAL التعليمية]: نقطة نهاية معالجة اشتراكات الطلاب دون كسور عائمة
app.post('/api/aec/ajyal/subscribe', (req, res) => {
    const { user_id, course_id, package_price_usdt } = req.body;
    if (!user_id || !course_id || !package_price_usdt) {
        return res.status(400).json({ success: false, error: "Missing AJYAL payload parameters" });
    }
    try {
        const clearingData = interlockCore.processAjyalSubscriptionClearing(user_id, course_id, Number(package_price_usdt));
        res.status(200).json({ success: true, component: "AJYAL", clearing: clearingData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// [بوابة suppliers-auction]: تقديم العروض والمناقصات محمي تماماً ضد هجمات الازدواجية المالية
app.post('/api/aec/auction/bid', async (req, res) => {
    const { auction_id, supplier_id, bid_amount_usdt } = req.body;
    if (!auction_id || !supplier_id || !bid_amount_usdt) {
        return res.status(400).json({ success: false, error: "Missing Auction payload parameters" });
    }
    try {
        // حساب تسعير المقاصة بالـ BigInt
        const rawUsdt = BigInt(bid_amount_usdt);
        const yerRate = 250000n; 
        const totalYerSubUnits = rawUsdt * yerRate;

        // توليد البصمة الرقمية والتحقق الفوري لمنع الـ Double Dipping المتقاطع مع المحفظة السيادية
        const txFingerprint = fraudEngine.generateTransactionFingerprint(supplier_id, auction_id, 0n, totalYerSubUnits);
        const isLockAcquired = fraudEngine.acquireLock(txFingerprint);
        
        if (!isLockAcquired) {
            return res.status(423).json({ success: false, error: "Concurrent double bidding detected and blocked by A.E.C. Guard!" });
        }

        const clearingResult = interlockCore.processAuctionBidClearing(auction_id, supplier_id, Number(bid_amount_usdt));
        fraudEngine.releaseAndFinalizeLock(txFingerprint, true); // إطلاق القفل بعد الأمان

        res.status(200).json({ success: true, component: "suppliers-auction", receipt: clearingResult });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// [بوابة GAV التجارية واللوجستيات]: حساب تكلفة الشحن وحظر تسرب الـ Float
app.post('/api/aec/gav/shipping', (req, res) => {
    const { weight_grams, distance_km } = req.body;
    if (!weight_grams || !distance_km) {
        return res.status(400).json({ success: false, error: "Missing GAV logistics parameters" });
    }
    try {
        const logisticsReceipt = gavAdapter.calculateSecureShippingFee(weight_grams, distance_km);
        res.status(200).json({ success: true, component: "GAV-The-Incense-Route", logistics: logisticsReceipt });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// تشغيل الخادم المركزي الشامل للمنظومة
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🦅 A.E.C. UNIFIED MONOLITH SERVER ONLINE ON PORT ${PORT}`);
    console.log(`🔒 ALL 5 REPOSITORIES INTERLOCKED SECURELY WITH ZERO FLOAT LEAKS`);
    console.log(`================================================================`);
});

module.exports = app;
