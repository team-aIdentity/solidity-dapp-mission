// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    // 이미지를 생성하는데 필요한 데이터
    struct ImageData {
        string title;
        string color;
    }

    mapping(uint256 => uint256) public tokenIdToLevels;
    mapping(uint256 => ImageData) public tokenIdToImage; // 이미지 URL을 저장하기 위한 매핑

    constructor() ERC721 ("Chain Battles", "CBTLS") {}

    // NFT의 SVG 이미지를 생성하고 업데이트
    function generateCharacter(uint256 tokenId) public view returns(string memory) {
        ImageData memory imageData = tokenIdToImage[tokenId];
        
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
            '<rect width="100%" height="100%" fill="', imageData.color, '" />',
            '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">',imageData.title,'</text>',
            '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">', "Levels: ",getLevels(tokenId),'</text>',
            '</svg>'
        );

        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svg)
            )    
        );
    }

    // NFT의 현재 레벨 반환
    function getLevels(uint256 tokenId) public view returns (string memory) {
        uint256 levels = tokenIdToLevels[tokenId];
        return levels.toString();
    }

    // NFT의 TokenURI 반환
    function getTokenURI(uint256 tokenId) public view returns (string memory){
        ImageData memory imageData = tokenIdToImage[tokenId];
        require(bytes(imageData.title).length > 0, "No Image Title");

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Chain Battles #', tokenId.toString(), '",',
                '"description": "Battles on chain",',
                '"image": "', generateCharacter(tokenId), '"',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    // NFT 민팅
    function mint(string memory title, string memory color) public {
        _tokenIds.increment(); // 토큰 아이디 증가
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId); // 토큰 민팅

        tokenIdToLevels[newItemId] = 0; // 초기 레벨 세팅
        tokenIdToImage[newItemId] = ImageData(title, color); // 이미지 데이터 저장
        _setTokenURI(newItemId, getTokenURI(newItemId)); // 토큰 URI 설정
    }

    // NFT를 훈련하고 레벨을 높임
    function train(uint256 tokenId) public {
        // 존재하는 토큰인지, 토큰 소유자인지 확인
        require(_exists(tokenId), "Please use an existing token");
        require(ownerOf(tokenId) == msg.sender, "You must own this token to train it");

        uint256 currentLevel = tokenIdToLevels[tokenId];
        tokenIdToLevels[tokenId] = currentLevel + 1; // 레벨 증가
        _setTokenURI(tokenId, getTokenURI(tokenId)); // 토큰 URI 업데이트
    }
}
