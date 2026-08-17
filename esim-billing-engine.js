const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cobra-eSIM & BIGISH-YER Atomic Clearing Test Suite", function () {
    let CobraGateway, gateway, mockPiToken, mockYerToken, mockDexPair;
    let owner, walletA, walletB;

    // تطبيق دقة الأرقام الصحيحة الصارمة (BigInt) لمشروع BIGISH-YER
    const PI_DECIMALS = 10n ** 7n;   // 7 خانات عشرية لـ Pi
    const YER_DECIMALS = 10n ** 10n; // 10 خانات عشرية لـ YER

    beforeEach(async function () {
        [owner, walletA, walletB] = await ethers.getSigners();

        // نشر رموز اختبارية مطابقة للدقة القياسية
        const MockToken = await ethers.getContractFactory("ERC20Mock");
        mockPiToken = await MockToken.deploy("Pi Network", "PI", 7);
        mockYerToken = await MockToken.deploy("Yemen Stabilized", "YER", 10);

        // محاكاة مجمع السيولة لـ AMM
        const MockPair = await ethers.getContractFactory("PiDexPairMock");
        mockDexPair = await MockPair.deploy();

        // نشر بوابة المقاصة الرئيسية
        CobraGateway = await ethers.getContractFactory("CobraPaymentGateway");
        gateway = await CobraGateway.deploy(
            mockPiToken.address,
            mockYerToken.address,
            mockDexPair.address
        );
    });

    it("يجب أن يرفض المعاملة إذا انتهت صلاحية الثانية الذرية", async function () {
        const pastDeadline = (await ethers.provider.getBlock("latest")).timestamp - 10;

        await expect(
            gateway.processLocalEsimClearing(
                walletA.address,
                walletB.address,
                100n * PI_DECIMALS,
                50n * YER_DECIMALS,
                "pkg_global_5gb",
                pastDeadline
            )
        ).to.be.revertedWith("Cobra-BIGISH: Atomic second deadline exceeded");
    });

    it("يجب أن يمنع الإنفاق المزدوج في نفس الثانية الزمنية", async function () {
        const currentBlock = await ethers.provider.getBlock("latest");
        const strictDeadline = currentBlock.timestamp + 30;

        // منح صلاحية السحب للعقد الذكي
        await mockPiToken.connect(walletA).approve(gateway.address, 1000n * PI_DECIMALS);
        await mockYerToken.connect(walletB).approve(gateway.address, 1000n * YER_DECIMALS);

        // تنفيذ المعاملة الأولى بنجاح
        await gateway.processLocalEsimClearing(
            walletA.address,
            walletB.address,
            10n * PI_DECIMALS,
            5n * YER_DECIMALS,
            "pkg_yemen_10gb",
            strictDeadline
        );

        // محاولة تكرار نفس المعاملة في نفس الثانية (يجب أن تفشل)
        await expect(
            gateway.processLocalEsimClearing(
                walletA.address,
                walletB.address,
                10n * PI_DECIMALS,
                5n * YER_DECIMALS,
                "pkg_yemen_10gb",
                strictDeadline
            )
        ).to.be.revertedWith("Cobra-BIGISH: Anti-Double-Dipping triggered");
    });

    it("يجب أن يحسب السعر السيادي من AMM بدون كسور عشرية", async function () {
        // محاكاة احتياطيات المجمع: 1000 Pi مقابل 5000 YER
        await mockDexPair.setReserves(1000n * PI_DECIMALS, 5000n * YER_DECIMALS);
        
        const price = await gateway.getSovereignAmmPrice();
        // السعر المتوقع: (5000 * 10^10) / (1000 * 10^7) = 50000 (وحدة YER لكل Pi)
        expect(price).to.equal(50000n * YER_DECIMALS / PI_DECIMALS);
    });
});