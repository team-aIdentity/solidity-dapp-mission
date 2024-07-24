"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import styles from "./page.module.css";

const Home: NextPage = () => {
  const { writeContractAsync } = useScaffoldWriteContract("ChainBattles");

  // 사용자 입력 데이터
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("");

  // 토큰 이미지 url
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: tokenId } = useScaffoldReadContract({
    contractName: "ChainBattles",
    functionName: "_tokenIds",
    watch: true,
  });

  const { data: tokenURI, error, isLoading } = useScaffoldReadContract({
    contractName: "ChainBattles",
    functionName: "getTokenURI",
    args: [tokenId],
    watch: true,
  });

  const handleMinting = async () => {
    if(!title || !color) return;

    const notificationId = notification.loading("Minting...");

    try {
      await writeContractAsync({
        functionName: "mint",
        args: [title, color],
      });
      
      notification.remove(notificationId);
      notification.success("NFT minted.");

      setTitle("");
      setColor("");

    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to mint NFT.");
    }
  }

  const handleTraining = async () => {
    const notificationId = notification.loading("Training...");

    try {
      await writeContractAsync({
        functionName: "train",
        args: [tokenId],
      });
      
      notification.remove(notificationId);
      notification.success("NFT trained.");

    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to train NFT.");
    }
  }

  useEffect(() => {
    if (tokenURI) {
      console.log('my nft: ', tokenURI)
      try {
        // tokenURI에서 base64 데이터 추출
        const base64Data = tokenURI.split(",")[1];
        // base64 데이터를 디코딩하여 JSON으로 파싱
        const json = JSON.parse(atob(base64Data));
        // JSON 데이터에서 이미지 URL 추출
        setImageUrl(json.image);
      } catch (e) {
        console.error('Error parsing token URI:', e);
      }
    }
  }, [tokenURI]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">SpeedRunEthereum</span>
          <span className="block text-4xl font-bold">Challenge #6: Dynamic NFT</span>
        </h1>
        <div className="md:h-[60vh] flex flex-row items-center justify-center">

          {/* mint container */}
          <div className={styles["mint-container"]}>
            <div className={styles["title-container"]}>
              <span>Mint NFT</span>
              <div className={styles["input-container"]}>
                <label>Title : </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className={styles["input-container"]}>
                <label>Color : </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleMinting}>MINT NFT</button>
          </div>

          <div className={styles["split-line"]}></div>

          {/* show container */}
          <div className={styles["mint-container"]}>
            <div className={styles["title-container"]}>
              <span>Latest NFT</span>
              <div className={styles["img-container"]}>
                <div>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl} alt={`Token ${tokenId}`}
                      width={400}
                    />
                  ) : (
                    <div>Try to mint new NFT.</div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={handleTraining}>TRAIN NFT</button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Home;