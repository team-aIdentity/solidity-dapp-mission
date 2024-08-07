import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const chainlinkSubscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID;

  await deploy("MultiDiceRolls", {
    from: deployer,
    args: [chainlinkSubscriptionId],
    log: true,
    autoMine: true,
  });

};

export default deployYourContract;

deployYourContract.tags = ["YourContract"];
