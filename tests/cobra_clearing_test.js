const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cobra-eSIM & BIGISH-YER Clearing Node Test", function () {
    let CobraGateway, gateway, mockPiToken, mockYerToken, mockDexPair;
    let owner, walletA, walletB;

    // تحويل القيم إلى أرقام صحيحة صارمة (BigInt) متوافقة مع محددات BIGISH-YER
    const PI_DECIMALS = 10n ** 7n;   // 7 خانات لعملة Pi
    const YER_DECIMALS = 10n ** 10n; // 10 خانات للعملة المستقرة YER

    beforeEach(async function () {
        [owner, walletA, walletB] = await ethers.getSigners();

        // 1. نشر رموز اختبارية لمطابقة الدقة القياسية للمستودع السيادي
        const MockToken = await ethers.getContractFactory("ERC20Mock");
        mockPiToken = await MockToken.deploy("Pi Network", "PI", 7); // 7 Decimals
        mockYerToken = await MockToken.deploy("Yemeni Stabilized Token", "YER", 10); // 10 Decimals

        // 2. محاكاة مجمع السيولة المباشر للـ AMM
        const MockPair = await ethers.getContractFactory("PiDexPairMock");
        mockDexPair = await MockPair.deploy();

        // 3. نشر بوابة مقاصة Cobra eSIM
        CobraGateway = await ethers.getContractFactory("CobraPaymentGateway");
        gateway = await CobraGateway.deploy(mockPiToken.address, mockYerToken.address, mockDexPair.address);
    });

    it("يجب أن يمنع المعاملة فوراً إذا تخطت الثانية الزمنية المحددة للاستجابة الذرية", async function () {
        const pastDeadline = (await ethers.provider.getBlock("latest")).timestamp - 5; // وقت منتهي الصلاحية
        
        await expect(
            gateway.processLocalEsimClearing(
                walletA.address,
                walletB.address,
                100n * PI_DECIMALS,
                50n * YER_DECIMALS,
                "pkg_global_10gb",
                pastDeadline
            )
        ).to.be.revertedWith("Cobra-BIGISH: Atomic second deadline exceeded");
    });

    it("يجب أن يمنع الإنفاق المزدوج والتداخل التزامني (Anti-Double-Dipping) في نفس الثانية", async function () {
        const currentBlock = await ethers.provider.getBlock("latest");
        const strictDeadline = currentBlock.timestamp + 30;

        // منح صلاحيات السحب والمقاصة للعقد الذكي
        await mockPiToken.connect(walletA).approve(gateway.address, 1000n * PI_DECIMALS);
        await mockYerToken.connect(walletB).approve(gateway.address, 1000n * YER_DECIMALS);

        // التنفيذ الناجح للمرة الأولى
        await gateway.processLocalEsimClearing(
            walletA.address,
            walletB.address,
            10n * PI_DECIMALS,
            5n * YER_DECIMALS,
            "pkg_yemen_telecom",
            strictDeadline
        );

        // المحاولة الفورية المتداخلة لإعادة نفس المعاملة (يجب أن تفشل لحماية الصندوق السيادي)
        await expect(
            gateway.processLocalEsimClearing(
                walletA.address,
                walletB.address,
                10n * PI_DECIMALS,
                5n * YER_DECIMALS,
                "pkg_yemen_telecom",
                strictDeadline
            )
        ).to.be.revertedWith("Cobra-BIGISH: Anti-Double-Dipping triggered");
    });
});
