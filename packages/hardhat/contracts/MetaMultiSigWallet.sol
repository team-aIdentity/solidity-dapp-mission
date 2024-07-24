// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaMultiSigWallet {
    using ECDSA for bytes32;

    // 이벤트 정의
    event Deposit(address indexed sender, uint amount, uint balance);
    event ExecuteTransaction(address indexed owner, address payable to, uint256 value, bytes data, uint256 nonce, bytes32 hash);
    event Owner(address indexed owner, bool added);

    // 소유자 여부를 저장하는 매핑
    mapping(address => bool) public isOwner;

    uint public signaturesRequired; // 필요한 서명의 수
    uint public nonce=1; // 트랜잭션 nonce
    uint public chainId; // 체인 아이디

    constructor(uint256 _chainId, address[] memory _owners, uint _signaturesRequired) {
        // 서명 요구는 0 이상이어야 함
        require(_signaturesRequired > 0, "constructor: must be non-zero sigs required");
        signaturesRequired = _signaturesRequired;

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "constructor: zero address"); // 존재하는 주소인지 확인
            require(!isOwner[owner], "constructor: owner not unique"); // 중복인지 확인
            isOwner[owner] = true;
            emit Owner(owner, isOwner[owner]);
        }
        chainId = _chainId;
    }

    // 자기 자신만 호출 가능하게
    modifier onlySelf() {
        require(msg.sender == address(this), "Not Self");
        _;
    }

    // 새로운 서명자 추가
    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf returns (bool) {
        console.log('?', newSigner, newSignaturesRequired);
        require(newSigner != address(0), "addSigner: zero address");
        require(!isOwner[newSigner], "addSigner: owner not unique");
        require(newSignaturesRequired > 0, "addSigner: must be non-zero sigs required");
        isOwner[newSigner] = true; // 새로운 서명자 설정
        signaturesRequired = newSignaturesRequired; // 새로운 서명 요구 설정
        emit Owner(newSigner, isOwner[newSigner]);
        return true;
    }

    // 기존 서명자 제거
    function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlySelf returns (bool) {
        require(isOwner[oldSigner], "removeSigner: not owner");
        require(newSignaturesRequired > 0, "removeSigner: must be non-zero sigs required");
        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Owner(oldSigner, isOwner[oldSigner]);
        return true;
    }

    // 서명 요구 업데이트
    function updateSignaturesRequired(uint256 newSignaturesRequired) public onlySelf returns (bool) {
        require(newSignaturesRequired > 0, "updateSignaturesRequired: must be non-zero sigs required");
        signaturesRequired = newSignaturesRequired;
        return true;
    }

    // 트랜잭션 해시 생성
    function getTransactionHash(uint256 _nonce, address to, uint256 value, bytes memory data) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), chainId, _nonce, to, value, data));
    }

    // 트랜잭션 실행
    function executeTransaction(address payable to, uint256 value, bytes memory data, bytes[] memory signatures)
        public
    {
        // 소유자만 실행 가능함
        require(isOwner[msg.sender], "executeTransaction: only owners can execute");

        bytes32 _hash =  getTransactionHash(nonce, to, value, data); // 트랜잭션 해시
        nonce++; // nonce 증가
        uint256 validSignatures; // 유효 서명 수
        address duplicateGuard; // 중복 검사

        for (uint i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]); // 서명에서 주소 복구
            require(recovered != duplicateGuard, "executeTransaction: duplicate or unordered signatures");
            duplicateGuard = recovered;
            if(isOwner[recovered]){
              validSignatures++; // 유효 서명 증가
            }
        }

        // 유효 서명이 충분한지 확인
        require(validSignatures>=signaturesRequired, "executeTransaction: not enough valid signatures");

        // 트랜잭션 실행
        (bool success, ) = to.call{value: value}(data);
        console.log('result: ', success);
        require(success, "executeTransaction: tx failed");

        emit ExecuteTransaction(msg.sender, to, value, data, nonce-1, _hash);
    }

    // 서명 복구
    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return _hash.toEthSignedMessageHash().recover(_signature);
    }

    // 입금
    receive() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // 스트리밍 관련 이벤트 정의
    event OpenStream(address indexed to, uint256 amount, uint256 frequency);
    event CloseStream(address indexed to);
    event Withdraw(address indexed to, uint256 amount, string reason);

    struct Stream {
        uint256 amount; // 스트리밍 금액
        uint256 frequency; // 스트리밍 빈도
        uint256 last; // 마지막 인출 시간
    }
    mapping(address => Stream) public streams;

    // 스트림 인출
    function streamWithdraw(uint256 amount, string memory reason) public {
        require(streams[msg.sender].amount > 0, "withdraw: no open stream");
        _streamWithdraw(payable(msg.sender), amount, reason);
    }

    function _streamWithdraw(address payable to, uint256 amount, string memory reason) private {
        uint256 totalAmountCanWithdraw = streamBalance(to); // 인출 가능 금액
        require(totalAmountCanWithdraw >= amount,"withdraw: not enough");
        // 마지막 인출 시간 업데이트
        streams[to].last = streams[to].last + ((block.timestamp - streams[to].last) * amount / totalAmountCanWithdraw);
        emit Withdraw( to, amount, reason );
        to.transfer(amount); // 금액 전송
    }

    // 스트림 잔액 조회
    function streamBalance(address to) public view returns (uint256){
      return (streams[to].amount * (block.timestamp-streams[to].last)) / streams[to].frequency;
    }

    // 스트림 열기
    function openStream(address to, uint256 amount, uint256 frequency) public onlySelf {
        require(streams[to].amount == 0, "openStream: stream already open");
        require(amount > 0, "openStream: no amount");
        require(frequency > 0, "openStream: no frequency");

        streams[to].amount = amount; // 금액 설정
        streams[to].frequency = frequency; // 빈도 설정
        streams[to].last = block.timestamp; // 마지막 인출 시간 설정

        emit OpenStream(to, amount, frequency);
    }

    // 스트림 닫기
    function closeStream(address payable to) public onlySelf {
        require(streams[to].amount > 0, "closeStream: stream already closed");
        _streamWithdraw(to, streams[to].amount, "stream closed"); // 남은 금액 인출
        delete streams[to]; // 삭제
        emit CloseStream(to);
    }
}