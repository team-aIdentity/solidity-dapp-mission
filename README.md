# Scaffold-ETH 2로 간단한 Staking 만들기

## 🚩 Step 0. Staking이란?

스테이킹은 블록체인의 운영을 돕기 위해 개인의 암호 자산을 네트워크에 일정 기간 동안 잠그는 것을 의미한다. 사용자는 자신의 자산을 스테이킹함으로써 해당 네트워크의 보안과 운영에 기여하고, 그 대가로 보상을 받는다. 이는 새로운 암호화폐 토큰일 수도 있고, 거래 수수료의 일부일 수도 있다.

스테이킹은 지분 증명(Proof of Stake, PoS) 합의 메커니즘을 통해 작동한다. 지분 증명은 블록체인을 보호하기 위한 차세대 합의 프로토콜로, 복잡한 암호 문제를 해결하여 블록을 채굴하는 작업 증명(Proof of Work, PoW)과 달리, 자산 보유를 통해 네트워크에 새로운 거래를 안전하게 추가한다.

스테이킹을 쉽게 이해하려면 은행의 예적금을 떠올리면 된다. 은행에 자산을 일정 기간 예치하면, 은행은 그 자산을 대출하거나 투자해 수익을 창출하고, 그 대가로 예치자에게 이자를 지급한다.

차이점은 스테이킹은 중앙 기관 없이 사전 정의된 규칙(컨트랙트)에 따라 자동으로 운영된다는 점이다. 여기에서 이더리움의 가장 큰 장점 하나를 볼 수 있는데, 간단한 규칙 세트만으로 신뢰할 수 없는 사이의 사용자끼리도 함께 그룹을 이루어 작업할 수 있도록 해준다는 것다.

사용자는 합당한 보상을 받을 것에 대해 의심할 필요가 없으며, 최악의 경우에도 원래 넣어둔 자금을 돌려받을 수 있다. 사용자는 사람이나 기관이 아닌 코드만 신뢰하면 된다.

> 🔥 이번 미션에서는 간단한 Staking 컨트랙트를 배포하여 암호 자산을 네트워크에 잠그고, 일정 기간 이후 보상을 받을 수 있는 웹앱 프론트엔드를 제작한다.

---

## 🚩 Step 1. 환경

프로젝트 클론해가기

```sh
git clone -b staking --single-branch https://github.com/Ludium-Official/solidity-dapp-mission.git staking
cd staking
yarn install
```
---

### Op1) 로컬 환경에서 실행

```sh
# 로컬 블록체인 초기화
yarn chain

# 스마트 계약 배포
yarn deploy

# 프론트엔드 실행
yarn start
```

📱 http://localhost:3000 으로 접속해서 애플리케이션 열기

---

### Op2) 테스트넷 환경에서 실행

**🪪 배포자 (Deployer) 설정**

***방법 1. 배포자 주소를 생성하여 사용***

주소가 생성되면 니모닉은 로컬에 저장되고, 프라이빗 키를 따로 입력하지 않고 계약을 배포할 수 있다.

```sh
# 배포자 주소 생성
yarn generate

# 로컬 계정 잔액 확인
yarn account
```
위에서 생성된 주소로 sepoliaETH를 보내거나 공개 faucet에서 받는다.

***방법 2. 실제 소유한 주소를 사용***

`packages/hardhat/.env` 및 `packages/nextjs/.env.local`을 수정한다.

```bash
# .env
ALCHEMY_API_KEY=
DEPLOYER_PRIVATE_KEY=
```
본인 계정의 [Alchemy](https://dashboard.alchemy.com/apps) Apps API key와 소유하고 있는 지갑의 프라이빗 키를 기입한다.

> Metamask 지갑의 경우, 계정 세부 정보로 들어가면 프라이빗 키를 얻을 수 있다.

<br/>

**🪝 배포하기**

***방법 1. defaultNetwork 설정***
`packages/hardhat/hardhat.config.ts`에서 defaultNetwork를 `sepolia`로 변경한다.

```sh
yarn deploy
```

***방법 2. 명령에서 네트워크 지정***
```sh
yarn deploy --network sepolia
```

<br/>

**🏛️ 프론트엔드 배포하기**

`packages/nextjs/scaffold.config.ts`를 아래처럼 변경한다.

```typescript
const scaffoldConfig = {
  targetNetworks: [chains.sepolia],

  // ...

  onlyLocalBurnerWallet: false,
} as const satisfies ScaffoldConfig;
```

NestJS 애플리케이션을 배포한다. [Vercel](https://vercel.com/) 에서 로그인 후 dashboard로 이동해 `Add New -> Project` 를 클릭한 후 GitHub repository를 임포트해온다.

```shell
yarn vercel
```

📱 Vercel이 제공하는 url 로 접속해서 애플리케이션 열기

---

## 🚩 Step 2. Staking

로컬 환경에서 실행한 경우 지난 번과 동일하게 오른쪽 상단의 `Grab funds from faucet` 버튼을 클릭해 로컬 지갑으로 자금을 보낸다.

테스트넷 환경에서 실행한 경우 실제 지갑이 보유하고 있는 자금을 확인할 수 있다.

✏️ 'Staker UI' 탭에서 `STAKE 0.5 ETHER!` 버튼을 클릭한다.

<image src='./images/stake_ether.png' width='300px' /> 

`You Staked`와 `Total Staked`에 0.5 ETH가 추가된 것을 확인할 수 있다.

이번에는 새로운 시크릿 창을 열어서 새로운 지갑 주소로 Stake를 실행한다.

`Stake Events` 탭으로 이동하면 지금까지 발생한 스테이킹 이벤트를 모두 확인할 수 있다.

<image src='./images/stake_events.png' width='300px' /> 

## 🚩 Step 3. 상태 기계(State Machine) / 타이밍(Timing)

### 상태 기계(State Machine)

`packages/hardhat/contracts/Staker.sol`를 상태 기계의 측면에서 본다. 먼저 스테이크 기간이 충족되고 목표 임계값만큼 ETH가 모이면 **성공 상태**가 되고, 그렇지 않으면 사용자가 자금을 인출할 수 있는 **인출 상태**가 된다.

성공 상태에서는 `execute`를 실행할 수 있고, 인출 상태에서는 `withdraw`를 실행할 수 있다.

`execute()` 함수는 성공 상태가 된 후, 누구나 한 번만 호출할 수 있다.

### 타이밍(Timing)

`timeLeft()` 함수에서 스테이킹 마감 기간까지 남은 시간을 반환한다. 이미 마감이 지난 경우 0을 반환한다.

`timeLeft()`는 트랜잭션이 발생할 때만 업데이트된다. 네비게이션 바의 faucet 버튼을 눌러 새 자금을 받거나, 새로 stake()를 실행하면 새 블록이 생성되어 시간을 업데이트 할 수 있다.

![stakerUI](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/7d85badb-3ea3-4f3c-b5f8-43d5b64f6714)

> `yarn deploy --reset` 명령을 실행하여 스마트 계약에 변경이 없더라도 언제든 새롭게 배포할 수 있다.

<br/>

테스트를 위해 `packages/hardhat/contracts/Staker.sol`의 마감 기간을 3일에서 30초로 바꾸고 다시 배포 해보자.

```solidity
uint256 public deadline = block.timestamp + 30 seconds;
```

`Staker UI` 탭에서 `Time Left`가 0이 되고, `Total Staked`가 1 ETH 이상이면 `EXECUTE!` 버튼을 누른다.

`Debug Contracts` 탭에서 `completed`가 true 로 바뀌고, `Staker.sol`에서 `ExampleExternalContract.sol`로 전송된 스테이킹 자금이 예치 비율에 따라 분배되어 예치자의 주소로 인출될 것이다.

---

## 🚩 Step 4. Receive 함수

사용자 경험을 향상시키기 위해, 계약이 ETH를 받을 수 있도록 설정하고 stake()를 호출하는 receive() 함수를 사용한다.

`Staker.sol` 컨트랙트의 주소로 직접적으로 자금을 보내면 receive() 함수가 실행된다.

---

### 🐸 추가적으로 생각해 볼 것!

- execute 후에 컨트랙트로 자금을 보낸다면? 컨트랙트에 잔고로 남고 다시 돌려받을 수 없다.

  ```solidity
  receive() external payable {
      require(block.timestamp < deadline, "Staking period is over");
      stake();
  }
  ```

  스테이킹 마감 후에는 컨트랙트가 자금을 받을 수 없게 require문을 추가한다.

- modifier를 만들어서 `ExampleExternalContract`가 완료되지 않았는지 확인하자. 이 modifier를 `execute`와 `withdraw`에 추가하여 계약이 완료된 상태에서는 호출할 수 없도록 보호한다.

  ```solidity
  modifier notCompleted() {
      require(!exampleExternalContract.completed(), "Contract is already completed");
      _;
  }

  // ...

  function withdraw() public notCompleted {
    // ...
  }

  function execute() public notCompleted {
    // ...
  }
  ```