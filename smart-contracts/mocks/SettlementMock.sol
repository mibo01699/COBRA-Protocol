// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SettlementMock
 * @dev عقد ذكي محاكي لإدارة وتوثيق تسوية مدفوعات الطوارئ لبروتوكول COBRA
 * يلتزم العقد كلياً بحدود النزاهة التقنية المعزولة لـ Arabian Eagle Ecosystem (A.E.C.)
 */
contract SettlementMock {
    
    struct Session {
        string userId;
        uint256 dataConsumedBytes;
        uint256 costInPi;
        bool isSettled;
        uint256 timestamp;
    }

    address public admin;
    mapping(bytes32 => Session) public sessions;

    event SessionRegistered(bytes32 indexed sessionId, string userId, uint256 costInPi);
    event SettlementConfirmed(bytes32 indexed sessionId, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "COBRA Auth: Caller is not the authorized admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev تسجيل جلسة استهلاك بيانات جديدة (بيئة محاكاة آمنة)
     */
    function registerSession(
        bytes32 _sessionId,
        string memory _userId,
        uint256 _dataBytes,
        uint256 _costInPi
    ) external onlyAdmin {
        require(sessions[_sessionId].timestamp == 0, "COBRA Error: Session already exists");
        
        sessions[_sessionId] = Session({
            userId: _userId,
            dataConsumedBytes: _dataBytes,
            costInPi: _costInPi,
            isSettled: false,
            timestamp: block.timestamp
        });

        emit SessionRegistered(_sessionId, _userId, _costInPi);
    }

    /**
     * @dev تأكيد تسوية المعاملة عبر المحفظة المعزولة للـ dApp
     */
    function confirmSettlement(bytes32 _sessionId) external {
        require(sessions[_sessionId].timestamp > 0, "COBRA Error: Session does not exist");
        require(!sessions[_sessionId].isSettled, "COBRA Error: Session already settled");
        
        sessions[_sessionId].isSettled = true;
        emit SettlementConfirmed(_sessionId, block.timestamp);
    }
}
