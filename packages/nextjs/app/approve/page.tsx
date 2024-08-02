"use client"

import { ethers } from "ethers";
import type { NextPage } from "next";
import { Approver } from "~~/components/aave";
import { useTargetNetwork, useTransactor } from "~~/hooks/scaffold-eth";

const Approve: NextPage = () => {

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
  const tx = useTransactor();

  return (
    <div className="mt-20">
      <Approver
        userProvider={provider}
        tx={tx}
      />
    </div>
  );
};

export default Approve;
