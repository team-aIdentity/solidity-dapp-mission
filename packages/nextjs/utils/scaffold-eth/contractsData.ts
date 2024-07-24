import scaffoldConfig from "~~/scaffold.config";
import { contracts, ContractName } from "~~/utils/scaffold-eth/contract";

export function getAllContracts() {
  const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];
  return contractsData ? contractsData : {};
}

export function getContractNames() {
  const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];
  return contractsData ? (Object.keys(contractsData) as ContractName[]) : [];
}

export const getMainDiamondContract = (): ContractName | undefined => {
  const contractsData = getAllContracts();
  const contractNames = getContractNames();
  return contractNames.find((contractName: any) => {
    const contractAbi: any = contractsData[contractName].abi;
    return contractAbi.find((item: any) => item.type === "fallback" && item.stateMutability === "payable");
  });
};