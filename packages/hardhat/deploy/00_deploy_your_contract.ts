import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { getSelectors, FacetCutAction, getDiamond, ONE_ETHER } from "../utils/helpers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const dDiamondInit = await deploy("CrowdfundrDiamondInit", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const cDiamondInit = await hre.ethers.getContractAt(`CrowdfundrDiamondInit`, dDiamondInit.address);
  const cDiamondInitAddress = await cDiamondInit.getAddress();

  const FacetNames = ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"];

  const facetCuts = [];
  for (const FacetName of FacetNames) {
    const dFacet = await deploy(FacetName, {
      from: deployer,
      log: true,
      autoMine: true,
    });
    const cFacet = await hre.ethers.getContractAt(FacetName, dFacet.address);
    const cFacetAddress = await cFacet.getAddress();
    facetCuts.push({
      facetAddress: cFacetAddress,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(cFacet),
    });
  }
  
  // TODO  : Change this only ONE ETHER
  const functionCall = cDiamondInit.interface.encodeFunctionData("init", [ONE_ETHER * 4n]);

  // Setting arguments that will be used in the diamond constructor
  const diamondArgs = {
    owner: deployer,
    init: cDiamondInitAddress,
    initCalldata: functionCall,
  };

  // deploy Diamond
  const dDiamond = await deploy("CrowdfundrDiamond", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [facetCuts, diamondArgs],
  });

  const cDiamond = await getDiamond(["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"]);

  // TODO : Add new facets

  const facetsToAdd = ["MainFacet"];

  for (const facet of facetsToAdd) {
    await deploy(facet, {
      from: deployer,
      log: true,
      autoMine: true,
    });
    const cFacet: Contract = await hre.ethers.getContract(facet);
    const cFacetAddress = await cFacet.getAddress();
    const selectors = getSelectors(cFacet); // selectors of this facet
    const tx = await cDiamond.diamondCut(
      [
        {
          facetAddress: cFacetAddress,
          action: FacetCutAction.Add,
          functionSelectors: selectors,
        },
      ],
      hre.ethers.ZeroAddress,
      "0x",
      { gasLimit: 800000 },
    );
    await tx.wait();
  }
  const owner = await cDiamond.owner();
  console.log(owner);
  // const res = await cDiamond.getMinAmount1();
  // console.log(res);
};

export default deployYourContract;

deployYourContract.tags = ["CrowdfundrDiamond"];
