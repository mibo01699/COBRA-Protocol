// esim-billing-engine.js
// COBRA Protocol & BIGISH-YER - Lightweight Resilient Billing Engine for Free Replit Tier

const fs = require('fs');
const crypto = require('crypto');

class ESimBillingEngine {
    constructor(networkManager) {
        this.networkManager = networkManager;
        this.secretKey = crypto.randomBytes(32); 
        this.bufferPath = './secure_usage_buffer.dat';
        
        // التسعير بالوحدات الصارمة لمنع الكسر العائم (مضروبة في 10^10 للامتثال لـ BIGISH-YER)
        this.rateCardSubUnits = {
            cellular: 100000000n,    // 0.01 YER
            wifi: 20000000n,         // 0.002 YER
            mesh: 0n,                // مجاني
            satellite_mock: 1500000000n // 0.15 YER محاكاة
        };
    }

    calculateCost(megabytesUsed) {
        const currentRoute = this.networkManager.getActiveRoute();
        const pathType = currentRoute.path;
        const rate = this.rateCardSubUnits[pathType] || 100000000n;
        
        // حساب التكلفة الصافية بـ BigInt
        const costSubUnits = BigInt(megabytesUsed) * rate;

        const record = {
            timestamp: new Date().toISOString(),
            pathUsed: pathType,
            megabytes: megabytesUsed.toString(),
            costSubUnits: costSubUnits.toString(),
            settled: false
        };

        console.log(`[COBRA Billing] Encoded ${megabytesUsed}MB on [${pathType}]. SubUnits: ${costSubUnits.toString()}`);
        
        if (currentRoute.details.status === "ONLINE" && pathType !== "isolated_buffer") {
            this.forwardToPiDApp(record);
        } else {
            this.writeToLocalBuffer(record);
        }
        return record;
    }

    writeToLocalBuffer(record) {
        try {
            const dataString = JSON.stringify(record);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, iv);
            
            let encrypted = cipher.update(dataString, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const securePayload = { iv: iv.toString('hex'), payload: encrypted };
            
            // استخدام appendFileSync الخفيف لحفظ الذاكرة في Replit المجاني
            fs.appendFileSync(this.bufferPath, JSON.stringify(securePayload) + '\n');
        } catch (err) {
            console.error("[COBRA Critical] Buffer storage failure:", err);
        }
    }

    forwardToPiDApp(record) {
        console.log(`[A.E.C. Bridge] Relaying transaction to BIGISH-YER settlement Interlock.`);
    }
}

module.exports = ESimBillingEngine;
