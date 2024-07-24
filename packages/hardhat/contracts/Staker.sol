// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;  //Do not change the solidity version as it negativly impacts submission grading

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  ExampleExternalContract public exampleExternalContract;

  // 예치자 배열
  address[] public stakers;
  // 특정 주소가 예치한 자산 총액
  mapping(address => uint256) public balances;
  // 시연을 위한 threshold (목표 임계값)
  uint256 public constant threshold = 1 ether;
  // 스테이킹 종료 기간 (배포 이후 3일)
  uint256 public deadline = block.timestamp + 3 days;

  // 스테이킹이 이루어졌을 때 발생할 이벤트 정의
  event Stake(address indexed staker, uint256 amount);

  constructor(address exampleExternalContractAddress) {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  /**
   * @dev 스테이킹
   */
  function stake() public payable {
      // 스테이킹 마감 이전인지 확인
      require(block.timestamp < deadline, "Staking period is over");

      stakers.push(msg.sender); // 예치자 배열에 추가
      balances[msg.sender] += msg.value; // 스테이킹 총액 저장
      emit Stake(msg.sender, msg.value); // 이벤트 발생
  }

  /**
   * @dev 스테이킹 마감 이후 임계값 충족 됐을 때
   */
  function execute() public {
      // 스테이킹 마감 후인지 확인
      require(block.timestamp >= deadline, "Deadline has not been reached yet");

      // 임계값이 충족 되었으면
      require(address(this).balance >= threshold);
      
      // 외부 컨트랙트로 컨트랙트 보유 자금을 전송
      exampleExternalContract.complete{value: address(this).balance}();

      // 보상 분배
      distributeRewards();
  }

  /**
   * @dev 스테이킹 마감 이후 임계값 충족되지 않았을 때
   */
  function withdraw() public {
      // 사용자의 스테이킹 잔액이 0 이상인지 확인
      uint256 userBalance = balances[msg.sender];
      require(userBalance > 0, "No balance to withdraw");

      // 예치자 배열에서 제거
      for (uint i = 0; i < stakers.length; i++) {
          if (stakers[i] == msg.sender) {
              stakers[i] = stakers[stakers.length - 1];
              stakers.pop();
          }
      }

      // 사용자 잔액 인출
      balances[msg.sender] = 0;
      (bool sent, ) = msg.sender.call{value: userBalance}("");
      require(sent, "Failed to send Ether");
  }

  /**
   * @dev 스테이킹이 완료된 후 외부 컨트랙트로부터 자산과 보상을 분배
   */
  function distributeRewards() private {
      for (uint i = 0; i < stakers.length; i++) {
          address staker = stakers[i];
          uint256 stakerBalance = balances[staker];
          if (stakerBalance > 0) {
              exampleExternalContract.withdrawAll(staker, stakerBalance);
          }
      }
  }

  /**
   * @dev 스테이킹 마감까지 남은 기간 반환
   */
  function timeLeft() public view returns (uint256) {
      if (block.timestamp >= deadline) {
          return 0;
      } else {
          return deadline - block.timestamp;
      }
  }

  /**
   * @dev 컨트랙트가 이더를 수신하면 stake() 실행
   */
  receive() external payable {
      stake();
  }
}
