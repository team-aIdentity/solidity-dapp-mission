"use client"

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import axios from "axios";

import { ethers, parseEther } from "ethers";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { Address, BlockieAvatar } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useDeployedContractInfo, useTargetNetwork, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { usePoller } from "~~/hooks/multi-sig";
import { notification } from "~~/utils/scaffold-eth";

import TransactionDetail from "./_components/TransactionDetail"
import { useAccount } from "wagmi";

const Pool: NextPage = () => {
  const account = useAccount();

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
  const contract = useDeployedContractInfo("MetaMultiSigWallet");

  const { writeContractAsync } = useScaffoldWriteContract("MetaMultiSigWallet")

  const [transactions, setTransactions] = useState<any>([]);
  const [balance, setBalance] = useState("");

  const [visible, setVisible] = useState(false);

  const [signature, setSignature] = useState("");
  const [signData, setSignData] = useState<any>();
  const [finalSignatures, setFinalSignatures] = useState<any>([]);

  const { data: nonce } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "nonce",
    watch: true,
  })

  const { data: signaturesRequired } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "signaturesRequired",
    watch: true,
  })

  const { data: txHash, isLoading: txHashLoading } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "getTransactionHash",
    args: [
      signData?.nonce ? signData?.nonce : 0n,
      signData?.to ? signData?.to : "0x",
      signData?.amount ? parseEther("" + parseFloat(signData?.amount).toFixed(12)) : 0n,
      signData?.data ? signData?.data as `0x${string}` : '0x',
    ],
  })

  const { data: recovered, isLoading: recoveredLoading } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "recover",
    args: [
      txHash ? txHash : '0x',
      signature ? signature as `0x${string}` : '0x'
    ]
  })

  const { data: isOwner } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "isOwner",
    args: [recovered]
  })

  const customNonce = Number(nonce);

  // 컨트랙트의 balacne
  useEffect(() => {
    const getBalance = async () => {
      if(!provider || !contract.data) return;
      const balance = await provider.getBalance(contract.data?.address);
      setBalance(ethers.formatEther(balance));
    }
    getBalance();
  }, [provider])

  // 트랜잭션 데이터 파싱
  const parseTransactionData = async (tx: any) => {
    if(!contract.data) return;
    const contractInterface = new ethers.Interface(contract.data.abi);
    return contractInterface.parseTransaction({
      data: tx
    });
  }

  // 백엔드 서버에서 트랜잭션 정보 받기
  usePoller(() => {
    const getTransactions = async () => {
      if(!contract.data) return;

      const res = await axios.get(`http://localhost:49832/${contract.data?.address}_${targetNetwork.id}`)
      const newTransactions = [];

      for (const i in res.data) {
        const validSignatures: { signer: ethers.JsonRpcSigner; signature: any; }[] = [];
        const signer = await provider.getSigner();
        res.data[i].signatures.forEach((sig: any) => {
          validSignatures.push({signer, signature: sig})
        });

        const parsedTx = await parseTransactionData(res.data[i].data);
        
        const update = { ...res.data[i], validSignatures, parsedTx };
        newTransactions.push(update);
      }

      setTransactions(newTransactions);
      console.log("Loaded : ", newTransactions.length)
    }
    if(contract.data) getTransactions();
  }, 3777)

  useEffect(() => {
    console.log(signData);
    console.log('txHash : ', txHash); // 트랜잭션 해시
    console.log('signature : ', signature); // 서명
    console.log('recovered : ', recovered); // 서명 복구
    console.log('isOwner : ', isOwner); // owner인지 확인

    if(isOwner) {
      notification.success("Signed sucessfully");

      const getFianlSignature = async () => {
        const addSig = await addSignature();
        setFinalSignatures([...finalSignatures, addSig]);

        const res = await axios.post('http://localhost:49832', {
          chainId: targetNetwork.id,
          address: signData.to,
          nonce: signData.nonce,
          to: signData.to,
          amount: signData.amount,
          data: signData.data,
          hash: txHash,
          signatures: [...finalSignatures, addSig],
          signers: [recovered]
        })
        console.log(res);
      }
      getFianlSignature();
    }
  }, [signData, txHash, signature, recovered, isOwner])

  const addSignature = async () => {
    const signer = await provider.getSigner(account.address);
    const signature = await signer.provider.send("personal_sign", [txHash, account.address])
    return signature;
  }

  useEffect(() => {
    if(provider && txHash) {
      const getSignature = async () => {
        const signature = await addSignature();
        setSignature(signature);
      }
      getSignature();
    }
  }, [provider, txHash])

  // modal 창 닫기
  const handleModalClose = () => {
    setVisible(false);
  }

  if(!contract.data || transactions.length <= 0) return <>Loading...</>

  return (
    <>
      <div className="flex flex-col items-center">
        <h2 className="mt-20 mb-10"># {customNonce}</h2>

        <div className="border-2 p-2 mb-10 flex flex-col">
          {transactions && transactions.map((tx: any, index: number) => {
            const sigNum = tx.signatures.filter((value: any, index: number, self: any) => self.indexOf(value) === index);
            return(
              <div key={index}>
              {/* 1열 */}
              <div className="flex gap-10 m-2 items-center">
                <div className="font-bold"># {tx.nonce}</div>
                <div className="flex items-center">
                  <BlockieAvatar address={tx.hash} size={30} />
                  <div className="ml-2">{tx.hash.substring(0, 6)}...</div>
                </div>
                <div>
                  <Address address={contract.data?.address} />
                </div>
                <div>{balance} ETH</div>
                <div>
                  {sigNum.length} / {Number(signaturesRequired)} ✅
                </div>

                {/* Sign 버튼 */}
                <button
                  className="w-[80px] border-2 h-[40px] rounded-full"
                  onClick={async () => {
                    setSignData(tx)
                    setFinalSignatures(tx.signatures);
                  }}
                >Sign</button>

                {/* Exec 버튼 */}
                <button
                  className="w-[80px] border-2 h-[40px] bg-sky-500 rounded-full"
                  onClick={async () => {
                    if(tx.signatures.length < Number(signaturesRequired)) {
                      notification.error("Not enough valid signatures");
                      return;
                    }

                    // 중복 제거
                    const finalSig = tx.signatures.filter((value: any, index: number, self: any) => self.indexOf(value) === index);
                    console.log(finalSig)

                    const res = await writeContractAsync({
                      functionName: "executeTransaction",
                      args: [
                        tx.to,
                        parseEther("" + parseFloat(tx.amount).toFixed(12)),
                        tx.data,
                        finalSig
                      ]
                    })
                    console.log(res);

                    if(res) {
                      await axios.post('http://localhost:49832/txFinished', {
                        hash : tx.hash
                      })
                    }
                  }}
                >Exec</button>

                {/* Modal 버튼 */}
                <button
                  className="w-[80px] border-2 h-[40px] rounded-full"
                  onClick={() => {setVisible(!visible)}}
                >...</button>
              </div>
              {/* 2열 */}
              <div className="flex gap-10 m-2">
                <div>Event Name : {tx.parsedTx?.fragment.name}</div>
                <div>Addressed to : {tx.parsedTx?.args[0]}</div>
              </div>

              {/* Modal */}
              <TransactionDetail txnInfo={tx.parsedTx} visible={visible} handleModalClose={handleModalClose} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default Pool;
