"use client";

import type { NextPage } from "next";
import { ethers } from "ethers";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

import { Row } from "antd";
import { Swap } from "~~/components/aave";
import { useEffect, useState } from "react";

const Home: NextPage = () => {

  const { targetNetwork } = useTargetNetwork();
  console.log('targetNetwork: ', targetNetwork.name);

  const [selectedProvider, setSelectedProvider] = useState<any>();

  useEffect(() =>{
    const init = async () => {
      if(!window.ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
        setSelectedProvider(provider);
      }else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSelectedProvider(provider);
      }
    }
    init()
  }, [])

  const [tokenListURI, setTokenListURI] = useState('https://gateway.ipfs.io/ipns/tokens.uniswap.org')

  return (
    <div className="mt-20">
      <Row justify="center">
        <Swap
          selectedProvider={selectedProvider}
          tokenListURI={tokenListURI}
        />
      </Row>
    </div>
  );
};

export default Home;
