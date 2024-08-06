"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { tryToDisplay } from "~~/components/utils";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const ExampleUi: NextPage = () => {
  const { address } = useAccount();
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [pendingRandomNumber, setPendingRandomNumber] = useState(false);
  const [pendingNewPurpose, setPendingNewPurpose] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(false);

  const { data: purpose } = useScaffoldReadContract({
    contractName: "RandomNumberConsumer",
    functionName: "purpose",
  });

  const { data: requestId } = useScaffoldReadContract({
    contractName: "RandomNumberConsumer",
    functionName: "lastRequestId",
  });

  const { data: s_requests } = useScaffoldReadContract({
    contractName: "RandomNumberConsumer",
    functionName: "s_requests",
    args: [requestId],
  });

  const randomNumber = s_requests ? s_requests[2] : undefined;

  useEffect(() => {
    if (s_requests) {
      console.log(randomNumber);
    }
  }, [s_requests]);

  const { data: rollResult } = useScaffoldReadContract({
    contractName: "DiceRolls",
    functionName: "rollResult",
  });
  const diceRollResult = rollResult;

  const { writeContractAsync: writeRandomNumberConsumer } = useScaffoldWriteContract("RandomNumberConsumer");
  const { writeContractAsync: writeDiceRolls } = useScaffoldWriteContract("DiceRolls");

  const randomNumberDisplay =
    !requestId || !randomNumber ? (
      <div className="flex items-center space-x-2">
        <span>Loading...</span>
        <svg
          className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8V12z"></path>
        </svg>
      </div>
    ) : requestId === "0x0000000000000000000000000000000000000000000000000000000000000000" ? (
      <span>"None requested"</span>
    ) : (
      tryToDisplay(typeof randomNumber === "bigint" ? randomNumber.toString() : randomNumber)
    );

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Chainlink VRF Example</h2>

      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Randomness Consumer</h2>
          <h4 className="text-lg mb-4 text-gray-700 dark:text-gray-300">Purpose: {purpose}</h4>
          <div className="space-y-4">
            <input
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              onChange={e => setNewPurpose(e.target.value)}
              placeholder="Set a new purpose"
            />
            <button
              className={`w-full py-2 px-4 text-white rounded-md ${
                pendingNewPurpose ? "bg-blue-500 opacity-50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              } dark:bg-blue-400 dark:hover:bg-blue-500`}
              onClick={async () => {
                setPendingNewPurpose(true);
                try {
                  await writeRandomNumberConsumer({
                    functionName: "setPurpose",
                    args: [newPurpose],
                  });
                  setPendingNewPurpose(false);
                } catch (e) {
                  console.error("Error setting purpose:", e);
                  setPendingNewPurpose(false);
                }
              }}
              disabled={pendingNewPurpose}
            >
              Set Purpose!
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 my-4"></div>
          <h4 className="text-lg mb-2 text-gray-700 dark:text-gray-300">Random Number:</h4>
          {randomNumberDisplay}
          <div className="space-y-2 mt-4">
            <button
              className={`w-full py-2 px-4 text-white rounded-md ${
                pendingRandomNumber ? "bg-green-500 opacity-50 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              } dark:bg-green-400 dark:hover:bg-green-500`}
              onClick={async () => {
                setPendingRandomNumber(true);
                try {
                  await writeRandomNumberConsumer({
                    functionName: "requestRandomNumber",
                    args: [true],
                  });
                  setPendingRandomNumber(false);
                } catch (e) {
                  console.error("Error requesting random number:", e);
                  setPendingRandomNumber(false);
                }
              }}
              disabled={pendingRandomNumber}
            >
              Request Random Number!
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Dice Rolls</h2>
          <h4 className="text-lg mb-4 text-gray-700 dark:text-gray-300">Last Roll Result: {diceRollResult}</h4>
          <div className="space-y-2">
            <button
              className={`w-full py-2 px-4 text-white rounded-md ${
                pendingDiceRoll ? "bg-purple-500 opacity-50 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"
              } dark:bg-purple-400 dark:hover:bg-purple-500`}
              onClick={async () => {
                setPendingDiceRoll(true);
                try {
                  await writeDiceRolls({
                    functionName: "requestRandomRoll",
                  });
                  setPendingDiceRoll(false);
                } catch (e) {
                  console.error("Error rolling dice:", e);
                  setPendingDiceRoll(false);
                }
              }}
              disabled={pendingDiceRoll}
            >
              Roll Dice!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleUi;
