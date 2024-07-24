// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; //Do not change the solidity version as it negatively impacts submission grading

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// ERC-721 NFT의 커스텀 구현 스마트 계약
contract YourCollectible is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
	Ownable
{
	using Counters for Counters.Counter;

	// 각 새로운 토큰에 고유 ID를 부여하여 토큰 ID를 추적하기 위한 카운터
	Counters.Counter public tokenIdCounter;

	// 생성자는 토큰의 이름, 심볼 입력로 ERC721 컨트랙트를 초기화
	constructor() ERC721("YourCollectible", "YCB") {}

	// IPFS를 가리키는 베이스 uri를 반환
	function _baseURI() internal pure override returns (string memory) {
		return "https://ipfs.io/ipfs/"; 
	}

	// 새로운 NFT를 발행
	function mintItem(address to, string memory uri) public returns (uint256) {
		tokenIdCounter.increment(); // tokenIdCounter를 증가
		uint256 tokenId = tokenIdCounter.current();
		_safeMint(to, tokenId); // 새로운 토큰을 안전하게 발행
		_setTokenURI(tokenId, uri);// 토큰의 id와 uri를 매핑
		return tokenId; // 발행된 토큰의 ID를 반환
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 quantity
	) internal override(ERC721, ERC721Enumerable) {
		super._beforeTokenTransfer(from, to, tokenId, quantity);
	}

	// 토큰을 소각
	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	// 토큰의 전체 uri를 반환
	// NFT 데이터 (이미지, 타이틀, 설명 등)는 블록체인에 직접 저장되지 않고
	// IPFS 같은 분산 저장소에 저장되어 있기 때문에
	// 반환된 uri 통해 프론트엔드에서 해당 NFT의 데이터를 접근할 수 있음
	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721Enumerable, ERC721URIStorage)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}
