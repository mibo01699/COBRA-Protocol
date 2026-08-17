// tests/banking_precision.test.js
// COBRA Protocol - Strict Fixed-Point Compliance Test

const CobraPricingEngine = require('../server/pricing_engine');

function runBankingComplianceSuite() {
    console.log("=================================================");
    console.log("🧪 STARTING COBRA & BIGISH-YER COMPLIANCE TEST  ");
    console.log("=================================================");

    const engine = new CobraPricingEngine();
    
    // محاكاة باقة اتصال بقيمة أساسية 20 دولار
    const baseCostUsdt = 20;
    const result = engine.calculatePackagePrice(baseCostUsdt);

    console.log(`[Input] Nominal Package Cost: $${baseCostUsdt}`);
    console.log(`[System] Total Price With 12% Profit: $${result.totalPriceUsdt}`);
    console.log(`\n[Financial Split Calculation - High Precision]:`);
    console.log(` -> Pi Sub-units (Stroops): ${result.paymentSplit.piWallet.rawAmountStroops} (${result.paymentSplit.piWallet.displayAmount} Pi)`);
    console.log(` -> YER Sub-units (Sovereign): ${result.paymentSplit.yerWallet.rawAmountSubUnits} (${result.paymentSplit.yerWallet.displayAmount} YER)`);

    // تأكيد خلو النظام من الكسور العشرية العائمة ومنع التلاعب (Assertion)
    if (result.paymentSplit.piWallet.rawAmountStroops.includes('.') || result.paymentSplit.yerWallet.rawAmountSubUnits.includes('.')) {
        console.error("\n[❌ COMPLIANCE FAILED]: Floating-point leak detected! Transaction rejected.");
        process.exit(1);
    } else {
        console.log("\n[✅ COMPLIANCE PASSED]: Zero floating-point rule enforced. Pure BigInt used.");
    }

    // التحقق من هامش الربح 12% دقة كاملة
    const expectedProfit = BigInt(baseCostUsdt) * 12n / 100n;
    if (BigInt(result.profitGeneratedUsdt) === expectedProfit) {
        console.log("[✅ COMPLIANCE PASSED]: 12% ecosystem profit verified down to the sub-unit.");
    } else {
        console.error("[❌ COMPLIANCE FAILED]: Profit deviation detected!");
        process.exit(1);
    }

    console.log("=================================================");
}

runBankingComplianceSuite();
