"use client"

import type { NextPage } from "next";
import Ape from "./_components/Ape";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ethers } from "ethers";
import { ContractUI } from "../debug/_components/contract";

const AAVE: NextPage = () => {

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);

  return (
    <>
    <div className="mt-20">
      <Ape selectedProvider={provider} />
      {/* {targetNetwork.name == "Hardhat" &&
        <ContractUI contractName={"AaveApe"} />
      } */}
    </div>
    </>
  );
};

export default AAVE;
