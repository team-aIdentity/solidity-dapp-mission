import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as dotenv from "dotenv";

dotenv.config();

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const chainlinkSubscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID;

  if (!chainlinkSubscriptionId) {
    throw new Error("Please set your CHAINLINK_SUBSCRIPTION_ID in a .env file");
  }

  const apiConsumer = await deploy("APIConsumer", {
    from: deployer,
    args: [],
    log: true,
  });

  const coinGeckoConsumer = await deploy("CoinGeckoConsumer", {
    from: deployer,
    args: [],
    log: true,
  });

  const diceRolls = await deploy("DiceRolls", {
    from: deployer,
    args: [chainlinkSubscriptionId],
    log: true,
  });

  const multiDiceRolls = await deploy("MultihDiceRolls", {
    from: deployer,
    args: [chainlinkSubscriptionId],
    log: true,
  });

  const priceConsumerV3 = await deploy("PriceConsumerV3", {
    from: deployer,
    args: [],
    log: true,
  });

  const subscriptionConsumer = await deploy("RandomNumberConsumer", {
    from: deployer,
    args: [chainlinkSubscriptionId],
    log: true,
  });

  console.log("Contracts deployed:");
  console.log("APIConsumer:", apiConsumer.address);
  console.log("CoinGeckoConsumer:", coinGeckoConsumer.address);
  console.log("DiceRolls:", diceRolls.address);
  console.log("MultihDiceRolls:", multiDiceRolls.address);
  console.log("PriceConsumerV3:", priceConsumerV3.address);
  console.log("SubscriptionConsumer:", subscriptionConsumer.address);
};

export default deployContracts;

deployContracts.tags = ["all"];
