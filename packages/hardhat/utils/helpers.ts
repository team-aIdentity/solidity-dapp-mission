import { FormatTypes } from "@ethersproject/abi";
import { Contract, Interface } from "ethers";
import hre from "hardhat";
import { CrowdfundrDiamond, DiamondCutFacet } from "../typechain-types";
import { ethers } from "hardhat";
export type GeneralContract = DiamondCutFacet | CrowdfundrDiamond;

export const SECONDS_IN_DAY: number = 60 * 60 * 24;
export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };
export const ONE_ETHER = ethers.parseEther("1.0");

export async function getDiamond(facets: Array<string>): Promise<Contract> {
  const cDiamond = await hre.ethers.getContract("CrowdfundrDiamond");
  const cDiamondAddress = await cDiamond.getAddress();
  const generalABI: Array<string> = cDiamond.interface.format() as Array<string>;
  for (const Facet of facets) {
    const cFacet = await hre.ethers.getContract(Facet);
    generalABI.push(...cFacet.interface.format(/*FormatTypes.JSON*/));
  }
  return hre.ethers.getContractAt(generalABI, cDiamondAddress);
}

// get function selectors from ABI
export function getSelectors(contract: Contract) {
  const contractInterface = new Interface(contract.interface.fragments);
  const functions = contractInterface.fragments.filter((fragment) => fragment.type === 'function');

  const selectors: any = functions.reduce((acc: Array<string>, fragment) => {
    const signature = `${fragment.name}(${fragment.inputs.map((input) => input.type).join(',')})`;
    if (signature !== 'init(bytes)') {
      const sighash = ethers.id(fragment.format("sighash")).substring(0, 10)
      acc.push(sighash);
    }
    return acc;
  }, []);

  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  // console.log(selectors)
  return selectors;
}

// get function selector from function signature
export function getSelector(func: string) {
  const abiInterface = new ethers.Interface([func]);
  return abiInterface.getSighash(ethers.Fragment.from(func));
  // return abiInterface.getSighash(ethers.Fragment.from(func));
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
function remove(this: any, functionNames: Array<string>) {
  const selectors = this.filter((v: any) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(this: any, functionNames: any) {
  const selectors = this.filter((v: any) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: any, signatures: any) {
  const iface = new ethers.Interface(signatures.map((v: any) => "function " + v));
  const removeSelectors = signatures.map((v: any) => iface.getSighash(v));
  selectors = selectors.filter((v: any) => !removeSelectors.includes(v));
  return selectors;
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress: string, facets: any) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}
