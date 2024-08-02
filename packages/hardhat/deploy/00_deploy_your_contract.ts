import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  console.log("\n\n 📡 Deploying...\n");

  let mainnetConfig = {
    lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    uniswapRouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  }

  let sepoliaConfig = {
    lendingPoolAddressesProvider: "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A",
    uniswapRouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  }

  const contractName = "AaveApe";
  const contractArgs = [sepoliaConfig.lendingPoolAddressesProvider, sepoliaConfig.uniswapRouterAddress];

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const dAaveApe = await deploy(contractName, {
    from: deployer,
    args: [contractArgs[0], contractArgs[1]],
    log: true,
    autoMine: true,
  });
  const cAaveApe = await hre.ethers.getContractAt(contractName, dAaveApe.address);
  const deployedAddress = await cAaveApe.getAddress();

  const abiCoder = hre.ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(cAaveApe.interface.deploy.inputs, contractArgs);

  fs.writeFileSync(`artifacts/${contractName}.address`, deployedAddress);

  if(encoded || encoded.length > 2) fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  console.log(
    " 📄",
    contractName,
    "deployed to:",
    deployedAddress
  );


  // 테스트넷의 경우 ERC20 토큰 민팅하기
  const contractAddress = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
  const MintableToken = await hre.ethers.getContractAt("TestnetMintableERC20", contractAddress);

  const mintAmount = hre.ethers.parseUnits("5", 18); // 1000 DAI

  const tx = await MintableToken.mint(deployer, mintAmount);
  await tx.wait();
};

export default deployYourContract;

deployYourContract.tags = ["YourContract"];
