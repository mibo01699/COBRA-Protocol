// يتم تحديث هذا المقطع داخل العقد الذكي محلياً لتصحيح المجمعات وفق الصيغة الرسمية

interface IPiDexPair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract CobraPaymentGateway {
    // ... المتغيرات التأسيسية السابقة ...

    // عناوين مجمعات السيولة الرسمية والمنفصلة تماماً على DEX Pi
    address public piUsdPairAddress; // مجمع السيولة الرسمي [Pi/USD] لتحديد قيمة الـ Pi عالمياً
    address public yerPiPairAddress; // مجمع السيولة الرسمي والسيادي [YER/Pi] لتحديد قيمة الـ YER محلياً

    constructor(address _piToken, address _yerToken, address _piUsdPair, address _yerPiPair) {
        owner = msg.sender;
        piTokenAddress = _piToken;
        yerTokenAddress = _yerToken;
        piUsdPairAddress = _piUsdPair; // تثبيت مجمع Pi/USD
        yerPiPairAddress = _yerPiPair; // تثبيت مجمع YER/Pi
    }

    /**
     * @notice قراءة السعر اللحظي الرسمي لـ Pi مقابل الدولار من مجمع [Pi/USD]
     */
    function getLivePiToUsdPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = IPiDexPair(piUsdPairAddress).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Cobra-Error: Pi/USD Pool has zero liquidity");
        return (uint256(reserve1) * 10**18) / uint256(reserve0);
    }

    /**
     * @notice قراءة السعر اللحظي الرسمي لـ YER مقابل Pi من مجمع [YER/Pi]
     */
    function getLiveYerToPiPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = IPiDexPair(yerPiPairAddress).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Cobra-Error: YER/Pi Pool has zero liquidity");
        return (uint256(reserve1) * 10**18) / uint256(reserve0); // يعيد قيمة الـ Pi لكل وحدة YER
    }
}
