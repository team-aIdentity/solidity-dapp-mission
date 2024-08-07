// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "./Utilities.sol";

contract MultiDiceRolls is VRFConsumerBaseV2Plus {
    uint256 s_subscriptionId;

    address vrfCoordinatorV2Plus = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;

    bytes32 keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    uint32 callbackGasLimit = 1000000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    struct RollResult {
        bool hasRequested;
        uint256[] rollSet;
    }

    mapping(uint256 => address) public requests;
    mapping(address => RollResult) public rollResults;
    
    event RequestRolled(uint256);
    event Rolled(
        uint8 roll1,
        uint8 roll2,
        uint8 roll3,
        uint8 roll4,
        uint8 roll5,
        uint8 roll6,
        address roller
    );

    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinatorV2Plus) {
        s_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2Plus);
        s_subscriptionId = subscriptionId;
    }

    function requestRandomRoll() public {
        // require(
        //     !rollResults[msg.sender].hasRequested,
        //     "this account has already requested a roll"
        // );

        uint256 reqId = s_vrfCoordinator.requestRandomWords(VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: s_subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}))
        }));

        requests[reqId] = msg.sender;
        rollResults[msg.sender].hasRequested = true;
        emit RequestRolled(reqId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256[] memory _rollSet = Utilities.expand(randomWords[0], 6);
        rollResults[requests[requestId]].rollSet = _rollSet;

        emit Rolled(
            uint8(_rollSet[0]),
            uint8(_rollSet[1]),
            uint8(_rollSet[2]),
            uint8(_rollSet[3]),
            uint8(_rollSet[4]),
            uint8(_rollSet[5]),
            requests[requestId]
        );
    }

    function getHasRequested(address _user) external view returns (bool) {
        return rollResults[_user].hasRequested;
    }

    function getHasRollResult(address _user) external view returns (bool) {
        return rollResults[_user].rollSet.length > 0;
    }

    function getRollSet(address idx)
        public
        view
        returns(
            uint8,
            uint8,
            uint8,
            uint8,
            uint8,
            uint8
        )
    {
        uint256[] memory rollSet = rollResults[idx].rollSet;
        return (
            uint8(rollSet[0]),
            uint8(rollSet[1]),
            uint8(rollSet[2]),
            uint8(rollSet[3]),
            uint8(rollSet[4]),
            uint8(rollSet[5])
        );
    }
}