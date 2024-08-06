// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Chainlink, ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract CoinGeckoConsumer is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;

  bytes32 private jobId;
  uint256 private fee;

  uint256 public ethereumPrice;

  event RequestedEthereumPrice(bytes32 indexed requestId, uint256 price);

  constructor() ConfirmedOwner(msg.sender) {
    _setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    _setChainlinkOracle(0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD);
    jobId = "ca98366cc7314957b8c012c72f05aeeb";
    fee = (1 * LINK_DIVISIBILITY) / 10;
  }

  function RequestEthereumPrice() public returns (bytes32 requestId) {
    Chainlink.Request memory req = _buildChainlinkRequest(
      jobId,
      address(this),
      this.fulfillEthereumPrice.selector
    );

    req._add(
      "get",
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"    
    );

    req._add("path", "ethereum,usd");
    int256 timesAmount = 10 ** 18;
    req._addInt("times", timesAmount);

    return _sendChainlinkRequest(req, fee);
  }

  function fulfillEthereumPrice(bytes32 _requestId, uint256 _price)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestedEthereumPrice(_requestId, _price);
    ethereumPrice = _price;
  }

  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
    require(
      link.transfer(msg.sender, link.balanceOf(address(this))),
        "Unable to transfer"
    );
  }
}