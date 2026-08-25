// COBRA Protocol - Global Internet Capital Rotation Engine
// منظومة النسر العربي (A.E.C.) - محرك المقاصة وتدوير رأس مال مزودي الإنترنت
const BigNumber = require('bignumber.js');

class CobraInternetRotationEngine {
    constructor() {
        this.gcvPi = new BigNumber('314159.0000000');
        this.profitRate = new BigNumber('0.25'); // 25% أرباح صافية مخفية للاحتياطي
        this.networkAndWithdrawalOverhead = new BigNumber('1.05'); // إضافة 5% لتغطية غاز البلوكشين ورسوم السحب البنكي بالكامل على الزبون
    }

    /**
     * حساب دورة تدوير رأس مال باقة الإنترنت وضمان وصولها كاملة للمزود
     * @param {string|number} wholesaleDataCostUSD - تكلفة حزمة البيانات بالجملة من شركة الإنترنت
     * @param {string|number} yerToPiRate - سعر الـ YER مقابل الـ Pi في الـ DEX
     * @param {string|number} piToUsdtRate - سعر الـ Pi مقابل الـ USDT في مجمع السيولة
     */
    calculateInternetBundlePricing(wholesaleDataCostUSD, yerToPiRate, piToUsdtRate) {
        const C_wholesale = new BigNumber(wholesaleDataCostUSD);
        const X_yer_pi = new BigNumber(yerToPiRate);
        const X_pi_usdt = new BigNumber(piToUsdtRate);

        // 1. حساب صافي الأرباح (25%) المدمجة صامتاً
        const netProfitUSD = C_wholesale.times(this.profitRate);

        // 2. تدوير التكلفة الإجمالية وتضمين كامل رسوم السحب (5%) فوق حساب المستفيد لحماية رأس مال الخادم
        const grossOperationalCostUSD = C_wholesale.times(this.networkAndWithdrawalOverhead);
        
        // 3. التحويل العكسي عبر الـ DEX لمعرفة سعر البيع النهائي للمستهلك بالـ YER
        const requiredPiForCapital = grossOperationalCostUSD.div(X_pi_usdt);
        const finalRetailCostYER = requiredPiForCapital.div(X_yer_pi).toFixed(10);

        // 4. فرز الـ 25% أرباح صافية بوحدات الـ Stroops وتحويلها للاحتياطي بـ Pi بناءً على GCV
        const backendPiProfitStroops = netProfitUSD.div(this.gcvPi).toFixed(7);

        return {
            userDisplayCostYER: finalRetailCostYER.toString(), // السعر الإجمالي المعروض للمستخدم بالـ YER شامل كل رسوم السحب والأرباح
            fiatRotationTargetUSDT: grossOperationalCostUSD.toFixed(2), // كاش الدولار الموجه فوراً لحساب المدير التنفيذي لتغذية شركات الإنترنت
            sovereignReservePi: backendPiProfitStroops.toString(), // حصة أرباح النسر العربي المحجوزة
            status: "COBRA_INTERNET_ROTATION_SECURED"
        };
    }
}

module.exports = { CobraInternetRotationEngine };
