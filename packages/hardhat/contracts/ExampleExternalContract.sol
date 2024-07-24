// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;  //Do not change the solidity version as it negativly impacts submission grading

contract ExampleExternalContract {

  bool public completed;
  uint totalStaked;

  constructor() {}

  // 스테이킹 마감
  function complete() public payable {
    completed = true;
    totalStaked = msg.value;
  }

  // 보상 분배
  function withdrawAll(address staker, uint256 stakerBalance) public payable {
    // 예치 비율에 따른 보상 계산
    // totalStaked: 스테이킹 된 자산 총액
    // address(this).balacne: 플랫폼에서 사용자에게 보상으로 주기 위한 금액이 포함된 자산 총액
    uint256 reward = (address(this).balance * stakerBalance) / totalStaked;
    (bool sent, ) = staker.call{value: reward}("");
    require(sent, "Failed to send reward");
  }
}
