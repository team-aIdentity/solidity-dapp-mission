pragma solidity >=0.8.0 <0.9.0; //Do not change the solidity version as it negativly impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract DiceGame {
  uint256 public nonce = 0; // 난수 생성을 위한 nonce 값
  uint256 public prize = 0; // 현재 상금 풀

  // 이더가 충분하지 않을 때 발생하는 오류
  error NotEnoughEther();

  // 주사위를 굴렸을 때, 승리했을 때 발생하는 이벤트 정의
  event Roll(address indexed player, uint256 amount, uint256 roll);
  event Winner(address winner, uint256 amount);

  constructor() payable {
    resetPrize();
  }

  // 상금 풀을 초기화
  function resetPrize() private {
    prize = ((address(this).balance * 10) / 100); // 현재 컨트랙트의 잔고의 10%를 상금으로 설정
  }

  function rollTheDice() public payable {
    // 최소 0.002 이더를 송금했는지 확인
    if (msg.value < 0.002 ether) {
      revert NotEnoughEther();
    }

    // 이전 블록의 해시 값
    bytes32 prevHash = blockhash(block.number - 1);
    // 해시 값을 사용하여 난수를 생성
    bytes32 hash = keccak256(abi.encodePacked(prevHash, address(this), nonce));
    // 주사위 결과 값을 0에서 15 사이로 설정
    uint256 roll = uint256(hash) % 16;

    console.log("\t", "   Dice Game Roll:", block.number, roll);

    nonce++; // nonce 값을 증가
    prize += ((msg.value * 40) / 100); // 상금 풀에 송금된 이더의 40%를 추가

    emit Roll(msg.sender, msg.value, roll);

    // 결과 값이 5보다 크면 함수 종료
    if (roll > 5) {
      return;
    }

    // 결과 값이 0~5 사이면 승리
    uint256 amount = prize;
    (bool sent, ) = msg.sender.call{value: amount}(""); // 상금 지급
    require(sent, "Failed to send Ether");

    resetPrize(); // 상금 풀을 초기화
    emit Winner(msg.sender, amount);
  }

  receive() external payable {}
}
