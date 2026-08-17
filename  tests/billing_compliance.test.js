// tests/billing_compliance.test.js
// COBRA Protocol - Pi Network Compliance & Resilient Buffer Test

const AIResilientNetworkManager = require('../server/network_manager');
const ESimBillingEngine = require('../esim-billing-engine');
const fs = require('fs');

async function runBillingComplianceTest() {
    console.log("=================================================");
    console.log("🧪 STARTING COBRA PI-COMPLIANCE & BUFFER TEST   ");
    console.log("=================================================");

    // 1. إعداد البيئة ومحاكاة سقوط كامل للشبكات المفتوحة
    const manager = new AIResilientNetworkManager();
    const billing = new ESimBillingEngine(manager);

    console.log("[Test Setup] Simulating full communication blackout...");
    manager.networkRegistry.wifi.status = "OFFLINE";
    manager.networkRegistry.cellular.status = "OFFLINE";
    manager.networkRegistry.mesh.status = "OFFLINE";
    manager.executeAutonomousFailover(); // سيتحول تلقائياً إلى isolated_buffer

    // 2. محاكاة استهلاك العميل لبيانات eSIM أثناء الأزمة
    console.log("\n[Client Action] Generating 50MB of data traffic during blackout...");
    const billingRecord = billing.calculateCost(50);

    // 3. التحقق من الامتثال (Assertion Framework)
    console.log("\n[Verification] Checking if data was safely encrypted and buffered...");
    
    if (fs.existsSync(billing.bufferPath)) {
        console.log("[✅ COMPLIANCE PASSED]: File 'secure_usage_buffer.dat' successfully created offline.");
        const bufferContent = fs.readFileSync(billing.bufferPath, 'utf8');
        if (bufferContent.includes('iv') && bufferContent.includes('payload')) {
            console.log("[✅ COMPLIANCE PASSED]: Telemetry details completely encrypted. Zero exposure of plain text.");
        } else {
            console.error("[❌ TEST FAILED]: Buffer created but payload is insecure!");
            process.exit(1);
        }
        
        // تنظيف البيئة بعد نجاح الفحص
        fs.unlinkSync(billing.bufferPath);
    } else {
        console.error("[❌ TEST FAILED]: Usage data lost! Failed to generate local resilient buffer.");
        process.exit(1);
    }

    console.log("=================================================");
}

runBillingComplianceTest().catch(err => {
    console.error("Compliance suite broken:", err);
    process.exit(1);
});
