//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    /**
     * Returns the latest price
     */
    function getThePrice() public view returns (int256) {
        // all values but price can be left out if we don't use them
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}