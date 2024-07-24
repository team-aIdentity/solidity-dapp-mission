// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
	IERC20 token; // DEX에서 다룰 토큰 컨트랙트
	uint256 public totalLiquidity; // 유동성 총량
    mapping(address => uint256) public liquidity; // 각 계정이 제공한 유동성

	// ETH -> Token 스왑이 일어나면 발생하는 이벤트
	event EthToTokenSwap(
		address swapper,
		uint256 tokenOutput,
		uint256 ethInput
	);

	// Token -> ETH 스왑이 일어나면 발생하는 이벤트
	event TokenToEthSwap(
		address swapper,
		uint256 tokensInput,
		uint256 ethOutput
	);

	// 유동성이 공급되고 그에 따른 LP Token이 민팅되면 발생하는 이벤트
	event LiquidityProvided(
		address liquidityProvider,
		uint256 liquidityMinted,
		uint256 ethInput,
		uint256 tokensInput
	);

	// 유동성이 제거되고 그에 따른 LP Token이 burn되면 발생하는 이벤트
	event LiquidityRemoved(
		address liquidityRemover,
		uint256 liquidityWithdrawn,
		uint256 tokensOutput,
		uint256 ethOutput
	);

	constructor(address token_addr) {
		token = IERC20(token_addr);
	}

	// 초기화 (ETH, BAL을 DEX로 로드)
	// ETH와 BAL 초기 비율은 1:1로 동일하게 설정
	function init(uint256 tokens) public payable returns (uint256) {
		require(totalLiquidity == 0, "DEX: already initialized");
		require(tokens > 0 && msg.value > 0, "DEX: invalid initial amounts");

		totalLiquidity = address(this).balance; // 초기 유동성
        liquidity[msg.sender] = totalLiquidity;

		// 배포자가 DEX로 토큰 전송
        require(token.transferFrom(msg.sender, address(this), tokens), "DEX: transfer failed");

        emit LiquidityProvided(msg.sender, totalLiquidity, msg.value, tokens);

        return totalLiquidity;
	}

	// 유동성 풀의 가격을 계산
	function price(
		uint256 xInput, // 스왑하려는 토큰의 입력 양
		uint256 xReserves, // 스왑할 토큰의 현재 풀에 있는 양
		uint256 yReserves // 스왑 받을 토큰의 현재 풀에 있는 양
	) public pure returns (uint256 yOutput) {
		uint256 xInputWithFee = xInput * 997; // 0.3% 수수료 적용
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return numerator / denominator; // 스왑 받을 토큰의 출력 양
	}

	// 유저가 가지고 있는 LP Token 양으로 제공한 유동성 양 반환
	function getLiquidity(address lp) public view returns (uint256) {
		return liquidity[lp];
	}

	// ETH -> BAL 스왑
	function ethToToken() public payable returns (uint256 tokenOutput) {
		// 현재 풀에 있는 BAL 수량
		uint256 tokenReserves = token.balanceOf(address(this));
		// 스왑 받을 BAL 수량
        tokenOutput = price(msg.value, address(this).balance - msg.value, tokenReserves);
		// 사용자에게 계산된 BAL 전송
        require(token.transfer(msg.sender, tokenOutput), "DEX: transfer failed");

        emit EthToTokenSwap(msg.sender, tokenOutput, msg.value);

        return tokenOutput;
	}

	// BAL -> ETH 스왑
	function tokenToEth(
		uint256 tokenInput
	) public returns (uint256 ethOutput) {
		// 현재 풀에 있는 BAL 수량
		uint256 tokenReserves = token.balanceOf(address(this));
		// 스왑 받을 ETH 수량
        ethOutput = price(tokenInput, tokenReserves, address(this).balance);
		// 사용자가 입력한 BAL을 DEX에 전송
        require(token.transferFrom(msg.sender, address(this), tokenInput), "DEX: transfer failed");
		// 사용자에게 계산된 ETH 전송
        payable(msg.sender).transfer(ethOutput);

        emit TokenToEthSwap(msg.sender, tokenInput, ethOutput);

        return ethOutput;
	}

	// 유동성 추가
	function deposit() public payable returns (uint256 tokensDeposited) {
		// 현재 풀에 있는 ETH, BAL 수량
		uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));

		// 지불된 ETH에 상응하는 BAL을 사용자에게서 DEX로 전송
        uint256 tokenAmount = (msg.value * tokenReserves) / ethReserves;
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "DEX: transfer failed");

		// 유동성 계산하여 저장
        uint256 liquidityMinted = (msg.value * totalLiquidity) / ethReserves;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenAmount);

        return tokenAmount;
	}

	// 유동성 제거
	function withdraw(
		uint256 amount
	) public returns (uint256 ethAmount, uint256 tokenAmount) {
		// 사용자의 공급량에서 초과되는 양을 제거할 수 없음
		require(liquidity[msg.sender] >= amount, "DEX: insufficient liquidity");

        uint256 ethReserves = address(this).balance;
        uint256 tokenReserves = token.balanceOf(address(this));

		// 사용자가 돌려 받을 ETH, BAL 수량 계산
        ethAmount = (amount * ethReserves) / totalLiquidity;
        tokenAmount = (amount * tokenReserves) / totalLiquidity;

		// 유동성 제거
        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;

		// 사용자에게 계산된 ETH, BAL 전송
        payable(msg.sender).transfer(ethAmount);
        require(token.transfer(msg.sender, tokenAmount), "DEX: transfer failed");

        emit LiquidityRemoved(msg.sender, amount, tokenAmount, ethAmount);

        return (ethAmount, tokenAmount);
	}
}
