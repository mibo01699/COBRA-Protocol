// server/aec_interlock_core.js
// 🦅 ARABIAN EAGLE ECOSYSTEM (A.E.C.) - LIGHTWEIGHT INTERLOCK CORE

class AECInterlockCore {
    constructor() {
        this.PI_DECIMALS = 10000000n;        // 10^7 Stroops
        this.YER_DECIMALS = 10000000000n;    // 10^10 Sub-units
        this.idempotencyRegistry = new Set();
    }

    processAuctionBidClearing(auctionId, supplierId, bidAmountUsdt) {
        const rawUsdt = BigInt(bidAmountUsdt);
        const yerRate = 250000n; 
        const totalYerSubUnits = rawUsdt * yerRate;

        const transactionManifest = {
            component: "suppliers-auction",
            target: "BIGISH-YER",
            timestamp: new Date().toISOString(),
            idempotencyKey: `TX-AUCTION-${auctionId}-${supplierId}-${Date.now()}`,
            financials: {
                rawYerSubUnits: totalYerSubUnits.toString(),
                hasFloatLeak: false
            }
        };

        this.idempotencyRegistry.add(transactionManifest.idempotencyKey);
        // تنظيف الـ Set دورياً لحماية ذاكرة Replit المحدودة (Garbage Collection Assist)
        if (this.idempotencyRegistry.size > 100) this.idempotencyRegistry.clear();
        
        return transactionManifest;
    }

    orchestrateLogisticsTelemetry(routeId, packageId, baseCostUsdt) {
        const costBigInt = BigInt(baseCostUsdt);
        const profit = (costBigInt * 12n) / 100n;
        const totalCostUsdt = costBigInt + profit;

        return {
            component: "GAV-The-Incense-Route",
            target: "COBRA-Protocol",
            routeId: routeId,
            packageId: packageId,
            clearingCostUsdt: totalCostUsdt.toString(),
            networkMode: "SATELLITE_ORCHESTRATION_SIMULATION", 
            isMock: true
        };
    }

    processAjyalSubscriptionClearing(userId, courseId, packagePriceUsdt) {
        const priceBigInt = BigInt(packagePriceUsdt);
        const halfPriceUsdt = priceBigInt / 2n;

        const piStroops = (halfPriceUsdt * this.PI_DECIMALS) / 314159n; 
        const yerSubUnits = halfPriceUsdt * (this.YER_DECIMALS / 4n);    

        return {
            component: "AJYAL",
            userId: userId,
            courseId: courseId,
            splitPayment: {
                piStroops: piStroops.toString(),
                yerSubUnits: yerSubUnits.toString()
            }
        };
    }
}

module.exports = AECInterlockCore;
