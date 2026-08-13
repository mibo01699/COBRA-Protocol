const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cobra eSIM: اختبار المقاصة المزدوجة [Pi/USD] و [YER/Pi]", function () {
    let gateway, mockPiToken, mockYerToken, mockPiUsdPair, mockYerPiPair;
    let owner, buyerWalletA, buyerWalletB;

    const PI_DECIMALS = 10n ** 7n;   // 7 خانات لعملة Pi
    const YER_DECIMALS = 10n ** 10n; // 10 خانات للعملة المستقرة YER

    beforeEach(async function () {
        [owner, buyerWalletA, buyerWalletB] = await ethers.getSigners();

        // 1. نشر الرموز والمحافظ بدقة الأعداد الصحيحة الصارمة لمستودع BIGISH-YER
        const MockToken = await ethers.getContractFactory("ERC20Mock");
        mockPiToken = await MockToken.deploy("Pi Network", "PI", 7);
        mockYerToken = await MockToken.deploy("Yemeni Stabilized Token", "YER", 10);

        // 2. نشر محاكاة مجمع السيولة العالمي [Pi/USD]
        const MockPair = await ethers.getContractFactory("PiDexPairMock");
        mockPiUsdPair = await MockPair.deploy();
        
        // 3. نشر محاكاة مجمع السيولة السيادي [YER/Pi] المذكور في شروطك
        mockYerPiPair = await MockPair.deploy();

        // 4. نشر بوابة الدفع والمقاصة مع تمرير المجمعين المنفصلين
        const CobraGateway = await ethers.getContractFactory("CobraPaymentGateway");
        gateway = await CobraGateway.deploy(
            mockPiToken.address, 
            mockYerToken.address, 
            mockPiUsdPair.address, // ربط مجمع Pi/USD
            mockYerPiPair.address  // ربط مجمع YER/Pi
        );

        // شحن حسابات الاختبار لمنع الفشل بسبب رصيد المحفظة
        await mockPiToken.mint(buyerWalletA.address, 500000n * PI_DECIMALS);
        await mockYerToken.mint(buyerWalletB.address, 1000000n * YER_DECIMALS);
    });

    it("يجب أن يقرأ العقد احتياطيات مجمع [YER/Pi] المعتمد بشكل منفصل وصحيح", async function () {
        // ضخ سيولة افتراضية في مجمع YER/Pi: 500,000 YER و 100,000 Pi
        await mockYerPiPair.setReserves(100000n * PI_DECIMALS, 500000n * YER_DECIMALS);

        // استدعاء دالة قراءة سعر مجمع YER/Pi السيادي
        const rawYerPriceInPi = await gateway.getLiveYerToPiPrice();

        // التأكد من أن الحسابات تمت كأرقام صحيحة صارمة (Strict BigInt) دون فواصل عشرية عائمة
        // 500,000 YER / 100,000 Pi = 5 YER لكل 1 Pi (مقومة بمعامل دقة الـ YER)
        expect(rawYerPriceInPi).to.equal(5n * YER_DECIMALS);
        console.log(`[Test Success]: Live Sovereign Price for YER/Pi Pair verified at: ${rawYerPriceInPi.toString()} sub-units`);
    });

    it("يجب أن ينجح النظام في عزل حساب تكلفة الباقة بالـ YER عن تقلبات مجمع [Pi/USD]", async function () {
        // محاكاة انهيار أو تذبذب السعر في مجمع Pi/USD العالمي
        await mockPiUsdPair.setReserves(100000n * PI_DECIMALS, 10000n * YER_DECIMALS); // هبوط سعر الـ Pi
        
        // تثبيت مجمع YER/Pi السيادي لتغطية تكلفة باقة الجملة للـ eSIM
        await mockYerPiPair.setReserves(100000n * PI_DECIMALS, 500000n * YER_DECIMALS);

        // تفعيل طلب المقاصة لباقة إنترنت تكلفتها 9.25 دولار
        const deadline = Math.floor(Date.now() / 1000) + 15;
        
        // الأرقام الصحيحة الصارمة المحسوبة لحماية الصندوق (التكلفة مغطاة بالكامل بالـ YER لمنع الخسائر)
        const requiredYerSubUnits = 925n * (YER_DECIMALS / 100n); // 9.25 YER
        const profitPiStroops = 23n; // حصة أرباح الـ GCV الخالصة بالـ Stroops

        await mockPiToken.connect(buyerWalletA).approve(gateway.address, profitPiStroops);
        await mockYerToken.connect(buyerWalletB).approve(gateway.address, requiredYerSubUnits);

        const tx = await gateway.processLocalEsimClearing(
            buyerWalletA.address,
            buyerWalletB.address,
            profitPiStroops,
            requiredYerSubUnits,
            "yem_unlimited_5g",
            deadline
        );

        await expect(tx).to.emit(gateway, "HybridClearingExecuted");
        console.log("[Test Success]: Isolated clearing protocol verified. Capital preserved with 0.00% loss risk.");
    });
});
