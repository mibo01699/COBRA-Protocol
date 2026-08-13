// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Cobra eSIM Hybrid Payment & Liquidity Gateway
 * @dev هذا العقد مغلق المصدر وضمن بيئة إنتاجية خاصة بمشروع Cobra eSIM.
 * يدير الدفع المشترك (Pi + YER) بالثانية الواحدة ويضمن حماية الأرباح.
 */

interface IPiDexPair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract CobraPaymentGateway {
    address public owner;
    address public yerTokenAddress;
    address public piDexPairAddress; // مجمع السيولة Pi / YER

    // الثوابت المحددة مسبقاً بناءً على شروط المشروع
    uint256 public constant PI_GCV_RATE = 314159 * 10**18; // قيمة GCV الافتراضية للـ Pi مقومة بـ 18 خانة عشرية
    uint256 public profitMargin = 8; // هامش ربح ثابت 8% (قابل للتعديل بين 5% إلى 12%)

    event PurchaseLogged(address indexed buyer, uint256 piAmount, uint256 yerAmount, string packageId, uint256 timestamp);
    event EmergencyRefundExecuted(address indexed buyer, uint256 piAmount, uint256 yerAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Cobra-Error: Only owner allowed");
        _;
    }

    constructor(address _yerToken, address _piDexPair) {
        owner = msg.sender;
        yerTokenAddress = _yerToken;
        piDexPairAddress = _piDexPair;
    }

    /**
     * @dev دمج المحافظ وسحب الدفع الهجين في ثانية واحدة متزامنة
     * @param walletA المحفظة الأولى للمشتري (لسحب Pi أو YER)
     * @param walletB المحفظة الثانية للمشتري (لإكمال الشق الآخر من الدفع)
     */
    function executeHybridPayment(
        address walletA,
        address walletB,
        uint256 piAmount,
        uint256 yerAmount,
        string memory packageId,
        uint256 deadline
    ) external onlyOwner returns (bool) {
        require(block.timestamp <= deadline, "Cobra-Error: Transaction expired, sub-second timeout");

        // 1. تنفيذ سحب الدفع المتزامن من محفظتي المشتري بعد تفويض العقد الذكي
        if (piAmount > 0) {
            // ملاحظة: يفترض هنا أن Pi تتبع معيار ERC20 عند إطلاق العقود الذكية على الشبكة
            require(IERC20(owner).transferFrom(walletA, owner, piAmount), "Cobra-Error: Failed to pull Pi from Wallet A");
        }
        
        if (yerAmount > 0) {
            require(IERC20(yerTokenAddress).transferFrom(walletB, owner, yerAmount), "Cobra-Error: Failed to pull YER from Wallet B");
        }

        emit PurchaseLogged(walletA, piAmount, yerAmount, packageId, block.timestamp);
        return true;
    }

    /**
     * @dev قراءة القيمة اللحظية التبادلية من الـ AMM لـ Pi DEX لحساب التوازن السعري ومنع الخسائر
     */
    function getLiveAmmPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = IPiDexPair(piDexPairAddress).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Cobra-Error: Insufficient DEX Liquidity");
        // حساب سعر الصرف اللحظي التبادلي بين الرموز داخل المجمع
        return (uint256(reserve1) * 10**18) / uint256(reserve0);
    }

    function setProfitMargin(uint256 _newMargin) external onlyOwner {
        require(_newMargin >= 5 && _newMargin <= 12, "Cobra-Error: Profit margin must be between 5% and 12%");
        profitMargin = _newMargin;
    }
}
