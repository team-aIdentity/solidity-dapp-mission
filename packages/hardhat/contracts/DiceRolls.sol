// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "./Utilities.sol";

contract DiceRolls is VRFConsumerBaseV2Plus {
    uint256 s_subscriptionId;

    address vrfCoordinatorV2Plus = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;

    bytes32 keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    uint256 public randomResult;
    uint8[] public rollSet;
    
    event Rolled(
        uint8 roll1,
        uint8 roll2,
        uint8 roll3,
        uint8 roll4,
        uint8 roll5,
        uint8 roll6
    );

    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinatorV2Plus) {
        s_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2Plus);
        s_subscriptionId = subscriptionId;
    }

    function requestRandomRoll() public {
        s_vrfCoordinator.requestRandomWords(VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: s_subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}))
        }));
    }

    function fulfillRandomWords(
        uint256,
        uint256[] calldata randomWords
    ) internal override {
        randomResult = randomWords[0];
        uint256[] memory sixRandomNumbers = Utilities.expand(randomResult, 6);
        rollSet = [
            uint8(sixRandomNumbers[0] % 6) + 1,
            uint8(sixRandomNumbers[1] % 6) + 1,
            uint8(sixRandomNumbers[2] % 6) + 1,
            uint8(sixRandomNumbers[3] % 6) + 1,
            uint8(sixRandomNumbers[4] % 6) + 1,
            uint8(sixRandomNumbers[5] % 6) + 1
        ];
        emit Rolled(
            rollSet[0],
            rollSet[1],
            rollSet[2],
            rollSet[3],
            rollSet[4],
            rollSet[5]
        );
    }

    function rollResult()
        public
        view
        returns (
            uint8,
            uint8,
            uint8,
            uint8,
            uint8,
            uint8
        )
    {
        return (
            rollSet[0],
            rollSet[1],
            rollSet[2],
            rollSet[3],
            rollSet[4],
            rollSet[5]
        );
    }
}