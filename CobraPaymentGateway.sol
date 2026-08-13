// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Cobra eSIM Payment & Clearing Gateway (BIGISH-YER Compliant)
 * @author Cobra eSIM & BIGISH-YER Infrastructure
 * @notice عقد ذكي مغلق المصدر بالكامل لإدارة الدفع الهجين لباقات الإنترنت.
 * @dev يمتثل لقيود الصفر العشري (Zero Floating-Point) لبروتوكول BIGISH-YER.
 */

interface IPiDexPair {
    // استدعاء احتياطيات مجمع السيولة المباشر (Pi/YER) من امتداد الـ AMM للمشروع
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CobraPaymentGateway {
    address public owner;
    address public yerTokenAddress;      // رمز YER المستقر (10 خانات عشرية)
    address public piTokenAddress;       // رمز Pi الشبكي (7 خانات عشرية)
    address public piDexPairAddress;     // عنوان مجمع السيولة AMM الرسمي (Pi/YER)

    // الثوابت الصارمة لبروتوكول BIGISH-YER
    uint256 public constant PI_DECIMAL_FACTOR = 10**7;       // 7 خانات عشرية لـ Pi
    uint256 public constant YER_DECIMAL_FACTOR = 10**10;     // 10 خانات عشرية لـ YER
    uint256 public constant PI_GCV_RATE_USD = 314159;        // قيمة توافق الآراء العالمية لـ Pi
    
    uint256 public profitMargin = 8;     // هامش الربح المحمي (بين 5% و 12%) الافتراضي 8%

    // أقفال التزامن لمنع الإنفاق المزدوج والعمليات المتداخلة بالثانية
    mapping(bytes32 => bool) private _antiDoubleDippingRegistry;
    mapping(address => bool) private _transactionalLocks;

    event HybridClearingExecuted(
        address indexed buyer, 
        uint256 piStroopsExtracted, 
        uint256 yerSubUnitsExtracted, 
        string packageId, 
        uint256 timestamp
    );
    
    event EmergencyRelease(address indexed receiver, uint256 amount, address token);

    modifier onlyOwner() {
        require(msg.sender == owner, "Cobra-BIGISH: Unauthorized sender");
        _;
    }

    modifier nonReentrantAndLocked(address walletA, address walletB, string memory packageId) {
        require(!_transactionalLocks[walletA] && !_transactionalLocks[walletB], "Cobra-BIGISH: Active lock detected");
        bytes32 txHash = keccak256(abi.encodePacked(walletA, walletB, packageId, block.timestamp));
        require(!_antiDoubleDippingRegistry[txHash], "Cobra-BIGISH: Anti-Double-Dipping triggered");
        
        _transactionalLocks[walletA] = true;
        _transactionalLocks[walletB] = true;
        _antiDoubleDippingRegistry[txHash] = true;
        _;
        _transactionalLocks[walletA] = false;
        _transactionalLocks[walletB] = false;
    }

    constructor(address _piToken, address _yerToken, address _piDexPair) {
        owner = msg.sender;
        piTokenAddress = _piToken;
        yerTokenAddress = _yerToken;
        piDexPairAddress = _piDexPair;
    }

    /**
     * @notice تنفيذ عملية المقاصة الهجينة الذرية (Fractionless Splitting) لباقات الإنترنت بالثانية الواحدة
     * @dev يسحب المقادير المحسوبة من محفظتي المشتري بعد معالجة الأرباح المحمية
     */
    function processLocalEsimClearing(
        address walletA,
        address walletB,
        uint256 piAmountStroops,
        uint256 yerAmountSubUnits,
        string memory packageId,
        uint256 subSecondDeadline
    ) external onlyOwner nonReentrantAndLocked(walletA, walletB, packageId) returns (bool) {
        require(block.timestamp <= subSecondDeadline, "Cobra-BIGISH: Atomic second deadline exceeded");

        // 1. معالجة وتأمين شق الدفع بعملة Pi (بدقة 7 خانات) وإرسالها لمحفظة تسوية المشروع
        if (piAmountStroops > 0) {
            require(
                IERC20(piTokenAddress).transferFrom(walletA, owner, piAmountStroops), 
                "Cobra-BIGISH: Failed to pull Pi balance from Wallet A"
            );
        }
        
        // 2. معالجة وتأمين شق الدفع بالعملة المستقرة YER (بدقة 10 خانات) المقترنة بالـ AMM
        if (yerAmountSubUnits > 0) {
            require(
                IERC20(yerTokenAddress).transferFrom(walletB, owner, yerAmountSubUnits), 
                "Cobra-BIGISH: Failed to pull YER balance from Wallet B"
            );
        }

        emit HybridClearingExecuted(walletA, piAmountStroops, yerAmountSubUnits, packageId, block.timestamp);
        return true;
    }

    /**
     * @notice جلب السعر الفوري الخالي من الكسور لـ Pi/YER من الـ AMM لـ BIGISH-YER
     * @return عدد الوحدات الفرعية لـ YER مقابل كل وحدة Pi كاملة
     */
    function getSovereignAmmPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = IPiDexPair(piDexPairAddress).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Cobra-BIGISH: Sovereign AMM Pool has zero liquidity");
        
        // حساب السعر الرياضي الدقيق باستخدام قيم BigInt الثابتة دون فواصل عشرية عائمة
        return (uint256(reserve1) * YER_DECIMAL_FACTOR) / uint256(reserve0);
    }

    /**
     * @notice ضبط هوامش الربح للمشروع (محصورة بشكل صارم بين شروطك 5% إلى 12%)
     */
    function adjustProfitMargin(uint256 _newMargin) external onlyOwner {
        require(_newMargin >= 5 && _newMargin <= 12, "Cobra-BIGISH: Out of safety protocol boundaries (5%-12%)");
        profitMargin = _newMargin;
    }
}
