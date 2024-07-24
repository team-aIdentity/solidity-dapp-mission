import { ethers } from "ethers";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const EIP2535Names: ContractName[] = ["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"];

const cDiamond = useDeployedContractInfo("CrowdfundrDiamond");

const getDiamondABI = async () => {
    let finalABI: any[] = [];
    if(cDiamond && cDiamond.data && cDiamond.data.abi) {
      const cDiamondABI = cDiamond.data.abi
      finalABI = [...cDiamondABI];
      for (const EIP2535Name of EIP2535Names) {
        const facet = useDeployedContractInfo(EIP2535Name);
        if(facet && facet.data && facet.data.abi) {
          const facetABI = facet.data.abi;
          finalABI = [...finalABI, ...facetABI]
        }
      }
    }
    return finalABI
}

export const getDiamonContract = async () => {
    if(!cDiamond.data) return;
    const diamondABI = await getDiamondABI();
    const diamondContract = new ethers.Contract(cDiamond.data?.address, diamondABI, provider);
    return diamondContract;
}