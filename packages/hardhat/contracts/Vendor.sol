pragma solidity 0.8.4; //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event SellTokens(address seller, uint256 amountOfETH, uint256 amountOfTokens);

  uint256 public constant tokensPerEth = 100;

  YourToken public yourToken;

  constructor(address tokenAddress) {
    yourToken = YourToken(tokenAddress);
  }

  /**
   * @dev ETH를 지불하여 토큰 구매
   */
  function buyTokens() public payable {
    require(msg.value > 0, "Value is not enough to buy tokens");
    // 사용자가 지불한 ETH
    uint256 amountOfETH = msg.value;
    // 사용자가 구매할 GLD
    uint256 amountOfTokens = msg.value * tokensPerEth;

    // 사용자에게 GLD 전송
    yourToken.transfer(msg.sender, amountOfTokens);

    // 토큰 구매 이벤트 발생
    emit BuyTokens(msg.sender, amountOfETH, amountOfTokens);
  }

  /**
   * @dev Vendor(owner)에게 컨트랙트 내 ETH 전송
   */
  function withdraw() public onlyOwner { // owner만 실행할 수 있음
    require(address(this).balance > 0, "No balance to withdraw");
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
  }

  function sellTokens(uint256 _amount) public {
    // 사용자가 받을 ETH
    uint amountOfETH = _amount / tokensPerEth;
    require(address(this).balance >= amountOfETH, "Not enough ETH in contract");

    // 사용자에게 ETH 전송
    (bool sent, ) = msg.sender.call{value: amountOfETH}("");
    require(sent, "Failed to send Ether");

    // 토큰을 Vendor에게 전송
    yourToken.transferFrom(msg.sender, address(this), _amount);

    // 토큰 판매 이벤트 발생
    emit SellTokens(msg.sender, amountOfETH, _amount);(msg.sender, amountOfETH, _amount);
  }
}
