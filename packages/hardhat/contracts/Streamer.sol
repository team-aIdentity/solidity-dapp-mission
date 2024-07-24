// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Streamer is Ownable {

  // 바우처 (거래 채권)
  struct Voucher {
    uint256 updatedBalance;
    Signature sig;
  }

  // 서명
  struct Signature {
    bytes32 r;
    bytes32 s;
    uint8 v;
  }

  event Opened(address, uint256); // 채널이 펀딩되면 발생하는 이벤트
  event Challenged(address); // 
  event Withdrawn(address, uint256);
  event Closed(address);

  mapping(address => uint256) balances;
  mapping(address => uint256) canCloseAt;

  // 채널 펀딩
  function fundChannel() public payable {
    // msg.sender가 이미 채널을 운영하고 있는지 확인
    require(balances[msg.sender] == 0, "Channel already funded");
    balances[msg.sender] = msg.value;
    emit Opened(msg.sender, msg.value);
  }

  // 남은 시간 반환
  function timeLeft(address channel) public view returns (uint256) {
    if (canCloseAt[channel] == 0 || canCloseAt[channel] < block.timestamp) {
      return 0;
    }
    return canCloseAt[channel] - block.timestamp;
  }

  // 서비스 제공자가 수익을 인출
  function withdrawEarnings(Voucher calldata voucher) public onlyOwner() {
    // 오프체인 코드와 마찬가지로, 서명은 데이터 원본이 아닌 해시로 적용
    bytes32 hashed = keccak256(abi.encode(voucher.updatedBalance));

    // 이더리움 오프체인 메시지 서명 및 검증에 사용되는 관례의 일부
    // 뒤에 오는 32는 첨부된 해시 메시지의 32 바이트 길이를 나타냄
    bytes memory prefixed = abi.encodePacked("\x19Ethereum Signed Message:\n32", hashed);
    bytes32 prefixedHashed = keccak256(prefixed);

    // 서명 검증, 서명이 유효한지 확인
    address signer = ecrecover(prefixedHashed, voucher.sig.v, voucher.sig.r, voucher.sig.s);
    require(balances[signer] > voucher.updatedBalance, "Invalid balance update");

    // 잔액 업데이트
    uint256 payment = balances[signer] - voucher.updatedBalance;
    balances[signer] = voucher.updatedBalance;

    payable(owner()).transfer(payment); // 서비스 제공자에게 수익 전송
    emit Withdrawn(signer, payment);
  }

  // 채널을 도전 상태로 변경
  function challengeChannel() public {
    require(balances[msg.sender] > 0, "No open channel");
    canCloseAt[msg.sender] = block.timestamp + 1 days; // 현재 시간부터 1일동안
    emit Challenged(msg.sender);
  }

  // 채널 폐쇄
  function defundChannel() public {
    require(canCloseAt[msg.sender] > 0, "Channel not challenged");
    require(block.timestamp > canCloseAt[msg.sender], "Channel still active");

    // 잔액, 남은 시간 초기화
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    canCloseAt[msg.sender] = 0;

    payable(msg.sender).transfer(amount); // 남은 자금을 msg.sender에게 전송
    emit Closed(msg.sender);
  }
}
