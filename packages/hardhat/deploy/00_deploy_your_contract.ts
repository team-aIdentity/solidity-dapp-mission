import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MetaMultiSigWallet", {
    from: deployer,
    // 매개변수: 체인 아이디, 초기 지갑 서명자 주소, 초기 필요한 서명 개수
    args: [
      31337,
      [
        deployer,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      ],
      2
    ],
    log: true,
    autoMine: true,
  });

  const yourContract = await hre.ethers.getContract<Contract>("MetaMultiSigWallet", deployer);
};

export default deployYourContract;

deployYourContract.tags = ["MetaMultiSigWallet"];
