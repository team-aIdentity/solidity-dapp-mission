//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract BuyMeACoffee {
    // Memo가 생성될 때 발생할 이벤트 정의
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );
    
    // Memo 구조체
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }
    
    // 컨트랙트 배포자의 주소
    // 나중에 특정 주소로 출금할 수 있도록 payable을 표시
    address payable owner;

    // memos 배열
    Memo[] memos;

    constructor() {
        // 배포자의 주소를 payable address로 저장
        // 이 특정 주소로 자금을 인출할 예정
        owner = payable(msg.sender);
    }

    /**
     * @dev 저장된 모든 memos를 반환
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev 가게 주인에게 ETH 팁을 보내고 메모를 남김
     * @param _name 구매자 이름
     * @param _message 구매자가 남긴 메시지
     */
    function buyCoffee(string memory _name, string memory _message) public payable {
        // 커피 구매를 위해 0 이상의 ETH를 보유하고 있어야 함
        require(msg.value > 0, "can't buy coffee for free!");

        // 메모 저장
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        // 새로운 메모에 대해 이벤트를 발생
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }

    /**
     * @dev 모든 저장된 잔액을 컨트랙트 소유주에게 전달
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }
}