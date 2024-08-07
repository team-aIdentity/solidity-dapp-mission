"use client";

import type { NextPage } from "next";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import EventsMultiDice from "~~/components/oracle/EventsMultiDice";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { Button, Divider, Spin } from "antd";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [pendingDiceRoll, setPendingDiceRoll] = useState(false);

  const { data: hasRequested } = useScaffoldReadContract({
    contractName: "MultiDiceRolls",
    functionName: "getHasRequested",
    args: [address]
  })
  const { data: rollResult } = useScaffoldReadContract({
    contractName: "MultiDiceRolls",
    functionName: "getRollSet",
    args: [address]
  })
  const { data: hasRollResult } = useScaffoldReadContract({
    contractName: "MultiDiceRolls",
    functionName: "getHasRollResult",
    args: [address]
  })

  const { writeContractAsync } = useScaffoldWriteContract("MultiDiceRolls");

  const rollResultDisplay = !hasRequested ? (
    "Not rolled yet"
  ) : !hasRollResult ? (
    <React.Fragment>
      <span style={{ marginRight: "1rem" }}>Waiting for oracle response</span>
      <Spin></Spin>
    </React.Fragment>
  ) : rollResult ? (
    rollResult.toString()
  ) : (
    ""
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "1rem auto", marginTop: 64 }}>
        <h2 style={{ backgroundColor: "#eeffff" }}>Multi Dice Rolls</h2>
        <h4>
          Your Roll Result: <br />
          {rollResultDisplay}
        </h4>
        <div style={{ margin: 8 }}>
          <Button
            loading={pendingDiceRoll}
            onClick={async () => {
              setPendingDiceRoll(true);
              try {
                await writeContractAsync({
                  functionName: "requestRandomRoll",
                });

                setPendingDiceRoll(false);
              } catch (e) {
                console.log("Error Write Contract >>>>> ", e);
              }
            }}
          >
            Do Your Roll!
          </Button>
        </div>
        <Divider />
        <EventsMultiDice />
      </div>
    </div>
  );
};

export default Home;
