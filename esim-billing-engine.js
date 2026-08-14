// esim-billing-engine.js - ربط مدفوعات لعملة Pi بهامش الأرباح حصراً لحماية رأس مال الاتصالات بنسبة 100%
class EsimProfitMarginClearingEngine {
    /**
     * احتساب فاتورة باقة الـ eSIM وحماية التاجر من الخسارة التشغيلية كلياً
     * @param {BigInt} totalRetailPriceInYCOIN - سعر البيع النهائي للمستهلك بالوحدات الصغرى للعملة الاستقرارية
     * @param {BigInt} costOfGoodsInYCOIN - التكلفة الأصلية للباقة (رأس المال المطلوب تغطيته نقدياً وبشكل كامل بـ YER)
     * @param {BigInt} gcvPiRateInYCOIN - سعر صرف الـ Pi المتوافق عليه بناءً على الـ GCV
     * @param {number} agreedProfitPiPercentage - النسبة المئوية المتفق عليها لاستقطاع Pi من "هامش الأرباح الصافية" فقط (0 - 100)
     */
    static calculateSecureInvoice(totalRetailPriceInYCOIN, costOfGoodsInYCOIN, gcvPiRateInYCOIN, agreedProfitPiPercentage) {
        if (totalRetailPriceInYCOIN < costOfGoodsInYCOIN) {
            throw new Error("SECURITY_ALERT: Transaction blocked. Retail price cannot be lower than operational cost!");
        }
        
        // 1. استخراج صافي هامش الربح بدقة BigInt الصارمة (سعر البيع - التكلفة المباشرة)
        const netProfitMargin = totalRetailPriceInYCOIN - costOfGoodsInYCOIN;
        const profitRatio = BigInt(agreedProfitPiPercentage);

        // 2. حساب حصة الـ Pi المقتطعة من داخل هامش الأرباح الصافية فقط
        const piShareFromProfit = (netProfitMargin * profitRatio) / 100n;
        
        // 3. بقية هامش الأرباح المتبقية التي ستسدد بالعملة المحلية المستقرة YER
        const yerShareFromProfit = netProfitMargin - piShareFromProfit;

        // 4. الإجمالي النهائي المطلوب سداده كاش بـ YER (التكلفة الأصلية كاملة لتغطية رأس المال + حصة أرباح الـ YER)
        const finalYerRequiredAmount = costOfGoodsInYCOIN + yerShareFromProfit;

        // 5. تحويل حصة الـ Pi المستقطعة من الأرباح إلى وحدات صغرى للبلوكشين (Stroops = 10^7) بناءً على سعر GCV
        const piPrecision = 10000000n;
        let finalPiRequiredInStroops = 0n;

        if (piShareFromProfit > 0n && gcvPiRateInYCOIN > 0n) {
            finalPiRequiredInStroops = (piShareFromProfit * piPrecision) / gcvPiRateInYCOIN;
        }

        return {
            auditStatus: "ZERO_LOSS_GUARANTEED_PROFIT_MARGIN_BOUNDED",
            yerTotalToCollect: finalYerRequiredAmount.toString(),       // استرداد وتأمين رأس مال باقة الـ eSIM كاملاً بـ YER
            piTotalToCollectStroops: finalPiRequiredInStroops.toString() // حصة الـ Pi المأخوذة من الربح الصافي فقط بقيمة GCV
        };
    }
}
module.exports = EsimProfitMarginClearingEngine;
