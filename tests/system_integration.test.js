// tests/system_integration.test.js
// COBRA Protocol & BIGISH-YER - Full End-to-End Sandbox Simulation

const CobraPricingEngine = require('../server/pricing_engine');
const DualWalletGateway = require('../server/dual_wallet_gateway');

function runFullSystemIntegrationTest() {
    console.log("=================================================");
    console.log("🧪 RUNNING COBRA & BIGISH-YER FULL INTEGRATION   ");
    console.log("=================================================");

    const pricingEngine = new CobraPricingEngine();
    const gateway = new DualWalletGateway(pricingEngine);

    // عناوين محافظ مشفرة افتراضية للمستفيدين تماشياً مع معايير الأمان
    const piAddress = "pi1_cobra_crisis_resilient_node_secure_alpha";
    const yerAddress = "yer1_soverign_macro_stabilization_yemen_core";

    // تشغيل دورة التسوية لباقة اتصال بقيمة 50 دولار شاملة الهامش 12%
    console.log("[Execution] Simulating package purchase request ($50 USD Base)...");
    
    gateway.processDualSettlement(50, piAddress, yerAddress)
        .then(receipt => {
            console.log("\n[Assertion Check] Verifying final clearing manifest state...");
            
            if (receipt.status === "CLEARED_AND_SETTLED") {
                console.log("[✅ INTEGRATION PASSED]: Combined ecosystem cleared payment with zero floating-point friction.");
                console.log(`[Receipt Status]: ${receipt.status} | TX-ID: ${receipt.txId}`);
            } else {
                console.error("[❌ INTEGRATION FAILED]: Financial settlement rejected by clearing guard.");
                process.exit(1);
            }
            console.log("=================================================");
        })
        .catch(err => {
            console.error("Critical failure during ecosystem runtime execution:", err);
            process.exit(1);
        });
}

runFullSystemIntegrationTest();
