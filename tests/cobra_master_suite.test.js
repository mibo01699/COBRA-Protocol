const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🐍 COBRA eSIM Master Suite & Financial Audit", function () {
    let gateway, mockPi, mockYer, mockPiUsdPool, mockYerPiPool;
    let owner, userA, userB;

    const PI_DECIMALS = 10n ** 7n;   // 7 خانات لـ Pi
    const YER_DECIMALS = 10n ** 10n; // 10 خانات لـ YER

    beforeEach(async function () {
        [owner, userA, userB] = await ethers.getSigners();

        // 1. نشر رموز اختبارية لمطابقة دقة مستودع BIGISH-YER
        const ERC20Factory = await ethers.getContractFactory("ERC20Mock");
        mockPi = await ERC20Factory.deploy("Pi Network", "PI", 7);
        mockYer = await ERC20Factory.deploy("Yemeni Stabilized Token", "YER", 10);

        // 2. نشر مجمعات السيولة المزدوجة لـ DEX Pi
        const PairFactory = await ethers.getContractFactory("PiDexPairMock");
        mockPiUsdPool = await PairFactory.deploy(); // مجمع Pi/USD
        mockYerPiPool = await PairFactory.deploy(); // مجمع YER/Pi

        // 3. نشر بوابة مقاصة Cobra eSIM
        const GatewayFactory = await ethers.getContractFactory("CobraPaymentGateway");
        gateway = await GatewayFactory.deploy(
            mockPi.address,
            mockYer.address,
            mockPiUsdPool.address,
            mockYerPiPool.address
        );

        // شحن محافظ المستخدم محلياً لتمكين المقاصة الهجينة
        await mockPi.mint(userA.address, 1000n * PI_DECIMALS);
        await mockYer.mint(userB.address, 5000n * YER_DECIMALS);
    });

    it("المطابقة الفنية: يجب أن ينجح دمج المحافظ والمقاصة الهجينة بدقة صفرية للكسور العائمة", async function () {
        const deadline = Math.floor(Date.now() / 1000) + 60;
        
        // المبالغ الصحيحة الصارمة بناءً على معايير GCV وحماية رأس المال من تذبذب AMM
        const piStroops = 15915n;         // خانة الأرباح (0.0015915 Pi)
        const yerSubUnits = 92500000000n; // خانة التكلفة الكاملة للجملة (9.25 YER)

        // منح تفويض للعقد الذكي من محفظتي المشتري بالتوازي
        await mockPi.connect(userA).approve(gateway.address, piStroops);
        await mockYer.connect(userB).approve(gateway.address, yerSubUnits);

        // إطلاق حركة المقاصة
        const tx = await gateway.processLocalEsimClearing(
            userA.address,
            userB.address,
            piStroops,
            yerSubUnits,
            "yem_5g_bulk_enterprise",
            deadline
        );

        await expect(tx).to.emit(gateway, "HybridClearingExecuted");
        
        // التحقق من وصول الأصول بالكامل لمحفظة تسوية المشروع
        expect(await mockPi.balanceOf(owner.address)).to.equal(piStroops);
        expect(await mockYer.balanceOf(owner.address)).to.equal(yerSubUnits);
    });

    it("أمان الحماية: يجب حظر ضبط هوامش أرباح خارج نطاق الحدود الآمنة (5%-12%)", async function () {
        // اختبار محاولة كسر حاجز الـ 5% كحد أدنى لحماية العقد
        await expect(gateway.adjustProfitMargin(4)).to.be.revertedWith(
            "Cobra-BIGISH: Out of safety protocol boundaries (5%-12%)"
        );
        // اختبار محاولة كسر حاجز الـ 12% كحد أقصى لمنع الابتزاز
        await expect(gateway.adjustProfitMargin(13)).to.be.revertedWith(
            "Cobra-BIGISH: Out of safety protocol boundaries (5%-12%)"
        );
    });
});
