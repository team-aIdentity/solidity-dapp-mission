"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ethers } from "ethers";
import coffee from "../public/coffee.png";

interface Memo {
  from: string;
  timestamp: bigint;
  name: string;
  message: string;
}

const Home: NextPage = () => {
  const { writeContractAsync } = useScaffoldWriteContract("BuyMeACoffee");

  const { data: memos, error, isLoading } = useScaffoldReadContract({
    contractName: "BuyMeACoffee",
    functionName: "getMemos",
    watch: true,
  });

  // 사용자 입력 데이터
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const handleBuyCoffee = async () => {
    if(!newName || !newMessage) return;

    const notificationId = notification.loading("Buying a coffee");

    try {
      await writeContractAsync({
        functionName: "buyCoffee",
        args: [newName, newMessage],
        value: ethers.parseEther("0.001")
      })
      
      notification.remove(notificationId);
      notification.success("Message and Tips sent");

      setNewName("");
      setNewMessage("");

    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to send message and tips");
    }
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">SpeedRunEthereum</span>
          <span className="block text-4xl font-bold">Challenge #1: Simple DeFi</span>
        </h1>
        <div className="md:h-[60vh] flex flex-row items-center justify-center">

          {/* Input container */}
          <div className="md:w-[30%] h-[100%] flex flex-col items-center p-3 m-2">
            <span className="block text-4xl mb-2 mt-6">Buy a Coffee!</span>
            <Image
            src={coffee}
            width="180"
            alt="challenge banner"
          />
            <div className="w-[100%] flex flex-col items-center mt-6">
              <label className="text-2xl mb-2">Name: </label>
              <input
                type="text"
                className="w-[100%] text-xl p-2 bg-white text-black"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="w-[100%] flex flex-col items-center mt-6">
              <label className="text-2xl mb-2">Message: </label>
              <textarea
                className="w-[100%] h-[150px] text-xl resize-none p-2 bg-white text-black"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
            <button
              className="mt-10 mb-2 text-xl rounded-xl border-4 p-2 cursor-pointer"
              onClick={handleBuyCoffee}
            >Send Message with Tips (0.001 ETH)</button>
          </div>

          <div className="h-[100%] border-4 m-4"></div>

          {/* show memos */}
          <div className="md:w-[40%] h-[100%] p-3 m-2 flex flex-col">
            <span className="block text-4xl mb-6 mt-6 flex justify-center">Message Board</span>
            <div className="flex flex-col items-center overflow-scroll">
              {memos && memos.map((memo: Memo, index: number) => {
                return (
                  <>
                  <div key={index} className="w-[100%] rounded-xl border-2 mb-2 p-2">
                    <div className="w-[100%]">from: {memo.name} ({memo.from})</div>
                    <div className="w-[100%]">message: {memo.message}</div>
                  </div>
                  </>
                )
              })}
            </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Home;
