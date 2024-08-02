"use client"

import type { NextPage } from "next";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ethers } from "ethers";

import { Row } from "antd";
import { Lend } from "~~/components/aave";
import { useExchangePrice } from "~~/hooks/aave";

const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;
const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)

const Lending: NextPage = () => {

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  return (
    <div className="mt-20">
      <Row justify="center">
        <Lend
          selectedProvider={provider}
          ethPrice={price}
        />
      </Row>
    </div>
  );
};

export default Lending;
