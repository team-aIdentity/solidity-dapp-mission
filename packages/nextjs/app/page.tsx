"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Button, Divider, Spin } from "antd";

const Home: NextPage = () => {
  const { address } = useAccount();

  const [pendingVolumeData, setPendingVolumeData] = useState(false);

  const { data: volumeData } = useScaffoldReadContract({
    contractName: "APIConsumer",
    functionName: "getVolume",
  });

  const { writeContractAsync: writeContract } = useScaffoldWriteContract("APIConsumer");

  let volumeDataDisplay;

  if (volumeData == undefined) {
    volumeDataDisplay = (
      <>
        Loading ... <Spin></Spin>
      </>
    );
  } else if (volumeData.toString() === "0") {
    volumeDataDisplay = <span style={{ color: "grey" }}>"None requested yet"</span>;
  } else {
    volumeDataDisplay = <>{volumeData.toString() || ""}</>;
  }

  return (
    <div>
      <h2 style={{ width: 400, margin: "4rem auto 0" }}>Chainlink API examples</h2>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "1rem auto" }}>
        <h2 style={{ backgroundColor: "#ffeeff" }}>APIConsumer</h2>
        <h4>
          24H ETH/USD Volume: <br />
          {volumeDataDisplay}
        </h4>
        <div style={{ margin: 8 }}>
          <Button
            loading={pendingVolumeData}
            onClick={async () => {
              setPendingVolumeData(true);
              // look how you call requestVolumeData on your contract:
              // notice how you pass a call back for tx updates too

              try {
                await writeContract({
                  functionName: "requestVolumeData",
                });

                setPendingVolumeData(false);
              } catch (e) {
                console.log("Error Write Contract >>>>> ", e);
              }

              // const result = tx(writeContracts.APIConsumer.requestVolumeData(), update => {
              //   console.log("📡 Transaction Update:", update);
              //   if (update && update.data === "Reverted") {
              //     setPendingVolumeData(false);
              //   }
              //   if (update && (update.status === "confirmed" || update.status === 1)) {
              //     setPendingVolumeData(false);
              //     console.log(" 🍾 Transaction " + update.hash + " finished!");
              //     console.log(
              //       " ⛽️ " +
              //         update.gasUsed +
              //         "/" +
              //         (update.gasLimit || update.gas) +
              //         " @ " +
              //         parseFloat(update.gasPrice) / 1000000000 +
              //         " gwei",
              //     );
              //   }
              // });
              // console.log("awaiting metamask/web3 confirm result...", result);
              // console.log(await result);
            }}
          >
            Request Volume Data!
          </Button>
        </div>
        <Divider />
      </div>
    </div>
  );
};

export default Home;
