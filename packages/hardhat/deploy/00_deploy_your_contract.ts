import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DEX } from "../typechain-types/contracts/DEX";
import { Balloons } from "../typechain-types/contracts/Balloons";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Balloons.sol 배포
  await deploy("Balloons", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const balloons: Balloons = await hre.ethers.getContract("Balloons", deployer);
  const balloonsAddress = await balloons.getAddress();

  // DEX.sol 배포
  await deploy("DEX", {
    from: deployer,
    args: [balloonsAddress], // 앞서 배포된 Balloons의 address
    log: true,
    autoMine: true,
  });

  const dex = (await hre.ethers.getContract("DEX", deployer)) as DEX;

  const dexAddress = await dex.getAddress();
  console.log("Approving DEX (" + dexAddress + ") to take Balloons from main account...");

  // DEX에게 100개만큼 권한을 위임
  await balloons.approve(dexAddress, hre.ethers.parseEther("100"));

  // DEX 초기화 (ETH 5, BAL 5)
  console.log("INIT exchange...");
  await dex.init(hre.ethers.parseEther("5"), {
    value: hre.ethers.parseEther("5"),
    gasLimit: 200000,
  });
};

export default deployYourContract;

deployYourContract.tags = ["Balloons", "DEX"];
