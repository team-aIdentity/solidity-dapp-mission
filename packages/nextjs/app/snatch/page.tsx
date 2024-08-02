"use client"

import { ethers } from "ethers";
import type { NextPage } from "next";
import { SnatchToken } from "~~/components/aave";
import { useTargetNetwork, useTransactor } from "~~/hooks/scaffold-eth";

const infura_api_key = process.env.NEXT_PUBLIC_INFURA_ID;
const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + infura_api_key)

const Snatch: NextPage = () => {
  
  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
  const tx = useTransactor();

  return (
    <>
      <div className="mt-20">
        <SnatchToken
          mainnetProvider={mainnetProvider}
          localProvider={provider}
          tx={tx}
        />
      </div>
    </>
  );
};

export default Snatch;
