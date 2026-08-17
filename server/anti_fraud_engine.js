// server/anti_fraud_engine.js
// COBRA Protocol & BIGISH-YER - High-Precision Anti-Double Dipping Engine

const crypto = require('crypto');

class CobraAntiFraudEngine {
    constructor() {
        // سجل للأقفال الذرية النشطة لمنع العمليات المتزامنة المخادعة
        this.activeLocks = new Set();
        // سجل البصمات الرقمية للمعاملات التي تمت تسويتها بنجاح
        this.settledIdempotencyKeys = new Set();
    }

    // توليد بصمة رقمية فريدة ومحمية للمعاملة (Idempotency Key) بناءً على تفاصيل الحساب والـ BigInt
    generateTransactionFingerprint(piAddress, yerAddress, piStroops, yerSubUnits) {
        const rawPayload = `${piAddress}-${yerAddress}-${piStroops.toString()}-${yerSubUnits.toString()}`;
        return crypto.createHash('sha256').update(rawPayload).digest('hex');
    }

    // حجز وتأمين القفل الذري للمعاملة قبل بدء البث لشبكة البلوكشين
    acquireLock(fingerprint) {
        if (this.activeLocks.has(fingerprint) || this.settledIdempotencyKeys.has(fingerprint)) {
            console.warn(`[COBRA Fraud Detection] Double dipping attempt blocked! Transaction fingerprint detected: ${fingerprint}`);
            return false; // رفض المعاملة فوراً لوجود عملية تداخل أو احتيال مكرر
        }
        
        this.activeLocks.add(fingerprint);
        console.log(`[COBRA Anti-Fraud] Atomic lock acquired for transaction fingerprint: ${fingerprint}`);
        return true;
    }

    // إطلاق القفل بعد إتمام المعاملة بنجاح وتسجيلها نهائياً كمعاملة غير قابلة للتكرار
    releaseAndFinalizeLock(fingerprint, isSuccess) {
        this.activeLocks.delete(fingerprint);
        if (isSuccess) {
            this.settledIdempotencyKeys.add(fingerprint);
            console.log(`[COBRA Anti-Fraud] Transaction permanently cleared. Idempotency key blacklisted for future duplicates.`);
        }
    }
}

module.exports = CobraAntiFraudEngine;
