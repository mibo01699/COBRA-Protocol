// esim-billing-engine.js
// COBRA Protocol - Crisis-Resilient Telecom Billing & Usage Buffer

const fs = require('fs');
const crypto = require('crypto');

class ESimBillingEngine {
    constructor(networkManager) {
        this.networkManager = networkManager;
        this.secretKey = crypto.randomBytes(32); // مفتاح تشفير مؤقت لحماية البيانات محلياً (لا يتم رفعه لـ GitHub)
        this.bufferPath = './secure_usage_buffer.dat';
        
        // أسعار البيانات لكل ميجابايت مقومة بعملة Pi الافتراضية للتسوية
        this.rateCard = {
            cellular: 0.01,
            wifi: 0.002,
            mesh: 0.000, // الشبكات المجتمعية مجانية
            satellite_mock: 0.15 // تكلفة عالية لمحاكاة الأقمار الصناعية
        };
    }

    // 1. قياس استهلاك البيانات الفعلي على المسار النشط بأمان
    calculateCost(megabytesUsed) {
        const currentRoute = this.networkManager.getActiveRoute();
        const pathType = currentRoute.path;
        const rate = this.rateCard[pathType] || 0.01;
        const costInPi = megabytesUsed * rate;

        const record = {
            timestamp: new Date().toISOString(),
            pathUsed: pathType,
            megabytes: megabytesUsed,
            cost: costInPi,
            settled: false
        };

        console.log(`[COBRA Billing] Tracked ${megabytesUsed}MB on [${pathType}]. Charge: ${costInPi} Pi.`);
        
        // التحقق من حالة الشبكة لتحديد مكان حفظ الفاتورة
        if (currentRoute.details.status === "ONLINE" && pathType !== "isolated_buffer") {
            this.forwardToPiDApp(record);
        } else {
            this.writeToLocalBuffer(record);
        }
        return record;
    }

    // 2. المخزن المؤقت المحلي الآمن (Local Usage Buffer) لحالات انقطاع الشبكة القصوى
    writeToLocalBuffer(record) {
        console.warn("[COBRA Security] Connection degraded. Encrypting usage log into local resilient buffer...");
        try {
            const dataString = JSON.stringify(record);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, iv);
            
            let encrypted = cipher.update(dataString, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const securePayload = {
                iv: iv.toString('hex'),
                payload: encrypted
            };

            // حفظ السجل المشفر في ملف مقاوم للأزمات لحين عودة الاتصال
            fs.appendFileSync(this.bufferPath, JSON.stringify(securePayload) + '\n');
            console.log("[COBRA Buffer] Append successful. Usage saved offline securely.");
        } catch (err) {
            console.error("[COBRA Critical] Failed to write secure telemetry buffer:", err);
        }
    }

    // إرسال البيانات فوراً لطبقة الـ dApp للتسوية المالية عند توفر الاتصال
    forwardToPiDApp(record) {
        console.log(`[COBRA Pi-Bridge] Broadcasting transaction to Pi Sandbox Ledger for accounting: ${record.cost} Pi.`);
        // هذا المكون يتكامل برمجياً مع واجهة العقد الذكي الموثق في المستودع
    }
}

module.exports = ESimBillingEngine;
