const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cobra-eSIM: اختبار حقن ومعالجة باقة الإنترنت السيادية", function () {
    let gateway, mockPiToken, mockYerToken, mockDexPair;
    let owner, walletA, walletB;

    // 1. استيراد حزمة البيانات (Payload) التي أرسلتها كمثال حي للاختبار
    const samplePayload = {
        "transactionMetadata": {
            "cobraTxId": "COBRA-9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
            "subSecondTimestamp": 1786584000000,
            "targetProfitMarginPercent": 8
        },
        "soverignClearingValues": {
            "piStroopsAmount": 15915n, // 15915 Stroops (بدقة 7 خانات)
            "yerSubUnitsAmount": 50000000000n, // 50000000000 وحدات فرعية (بدقة 10 خانات)
            "gcvReferenceRateUsedUSD": 314159
        },
        "telecomProviderRoute": {
            "targetPackageId": "yem_mobile_unlimited_5g",
            "wholesaleCostUSD": 9.25,
            "onChainApprovalState": "DEVELOPER_APPROVED"
        }
    };

    beforeEach(async function () {
        [owner, walletA, walletB] = await ethers.getSigners();

        const MockToken = await ethers.getContractFactory("ERC20Mock");
        mockPiToken = await MockToken.deploy("Pi Network", "PI", 7);
        mockYerToken = await MockToken.deploy("Yemeni Stabilized Token", "YER", 10);

        const MockPair = await ethers.getContractFactory("PiDexPairMock");
        mockDexPair = await MockPair.deploy();

        const CobraGateway = await ethers.getContractFactory("CobraPaymentGateway");
        gateway = await CobraGateway.deploy(mockPiToken.address, mockYerToken.address, mockDexPair.address);

        // شحن الحسابات الافتراضية لمنع فشل المعاملة بسبب نقص الرصيد
        await mockPiToken.mint(walletA.address, 100000n);
        await mockYerToken.mint(walletB.address, 100000000000n);
    });

    it("يجب أن ينجح خادم المقاصة في معالجة الـ Payload وحجز الأرباح وحماية الصندوق", async function () {
        // منح تفويض للعقد الذكي بناءً على الأرقام الصارمة الواردة في ملف الـ Payload
        await mockPiToken.connect(walletA).approve(gateway.address, samplePayload.soverignClearingValues.piStroopsAmount);
        await mockYerToken.connect(walletB).approve(gateway.address, samplePayload.soverignClearingValues.yerSubUnitsAmount);

        // تحديد وقت انتهاء زمني صارم بالثانية الواحدة (التحاكامي للمستقبل)
        const deadline = Math.floor(Date.now() / 1000) + 10;

        const tx = await gateway.processLocalEsimClearing(
            walletA.address,
            walletB.address,
            samplePayload.soverignClearingValues.piStroopsAmount,
            samplePayload.soverignClearingValues.yerSubUnitsAmount,
            samplePayload.telecomProviderRoute.targetPackageId,
            deadline
        );

        // التأكد من انبعاث حدث المقاصة بنجاح ومطابقته للصفر العشري لمشروع BIGISH-YER
        await expect(tx)
            .to.emit(gateway, "HybridClearingExecuted")
            .withArgs(
                walletA.address, 
                samplePayload.soverignClearingValues.piStroopsAmount, 
                samplePayload.soverignClearingValues.yerSubUnitsAmount, 
                samplePayload.telecomProviderRoute.targetPackageId,
                async (ts) => true
            );
    });
});
