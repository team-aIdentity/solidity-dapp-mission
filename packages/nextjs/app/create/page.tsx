"use client"

import axios from "axios";
import { ethers, parseEther } from "ethers";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

const Create: NextPage = () => {
  const router = useRouter();
  const account = useAccount();

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);

  // 트랜잭션을 위한 정보
  const methodName = useReadLocalStorage("method") as string;
  const newOwnerAddress = useReadLocalStorage("newOwner") as string;
  const newSigNum = useReadLocalStorage("newSigNum") as string;
  const data = useReadLocalStorage("data") as string;
  const to = useReadLocalStorage("to") as string;
  const amount = useReadLocalStorage("amount") as string;

  const [newOwner, setNewOwner] = useState("");
  const [signature, setSignature] = useState("");

  // 트랜잭션 결과 해시
  const [result, setResult] = useLocalStorage("result", "");

  const { data: nonce } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "nonce",
    watch: true,
  })

  const { data: txHash, isLoading: txHashLoading } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "getTransactionHash",
    args: [
      nonce,
      to,
      amount ? parseEther("" + parseFloat(amount).toFixed(12)) : 0n,
      data ? data as `0x${string}` : '0x',
    ]
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

  useEffect(() => {
    if(provider && txHash) {
      const getSignature = async () => {
        const signer = await provider.getSigner(account.address);
        const signature = await signer.provider.send("personal_sign", [txHash, account.address])
        setSignature(signature)
      }
      getSignature();
    }
  }, [provider, txHash])

  if(!data) return <>Please create tx on the Owners Tab first</>
  if(txHashLoading) return <>Loading...</>

  const customNonce = Number(nonce);

  return (
    <>
      <div className="flex flex-col items-center">
      <h2 className="mt-20 mb-10">Create Transaction</h2>

        {/* create transaction */}
        <div className="flex flex-col border-2 p-2 gap-3">
          {/* nonce */}
          <div className="m-2">
            <h3 className="p-2 text-center">Nonce</h3>
            <input
              className="w-[400px] m-2 h-10 p-3 bg-inherit flex border-2 border-base-300 bg-base-200 rounded-full"
              value={`# ${customNonce}`}
              disabled
            />
          </div>
          <div className="m-2">
            <h3 className="p-2 text-center">Method</h3>
            <select
              className="w-[400px] m-2 h-10 p-2 text-center bg-inherit flex border-2 border-base-300 bg-base-200 rounded-full"
              value={methodName}
              disabled
            >
              <option>addSigner</option>
              <option>removeSigner</option>
            </select>
          </div>
          <div className="m-2">
            <h3 className="p-2 text-center">To</h3>
            <AddressInput
              value={to}
              disabled
              onChange={setNewOwner}
            />
          </div>
          <div className="m-2">
            <h3 className="p-2 text-center">Calldata</h3>
            <input
              className="w-[400px] m-2 h-10 p-3 bg-inherit flex border-2 border-base-300 bg-base-200 rounded-full"
              value={data}
              disabled
            />
          </div>

          <div className="flex flex-col justify-center m-2">
            <h3 className="p-2 text-center">Details</h3>
            <div className="w-[400px] p-2">Function Signature : {methodName}(address,uint256)</div>
            <div className="w-[400px] p-2 flex">
              <span className="mr-2">newSigner :</span>
              <Address address={newOwnerAddress} />
            </div>
            <div className="w-[400px] p-2">newSignaturesRequirerd : {newSigNum}</div>
          </div>

          <div className="m-3 flex justify-center">
            <button
              className="w-[100px] h-[40px] bg-sky-500 rounded-full"
              onClick={async () => {
                if(!methodName || !newOwnerAddress || !newSigNum || !data || !to) return;
                console.log('txHash : ', txHash); // 트랜잭션 해시
                console.log('signature : ', signature); // 서명
                console.log('recovered : ', recovered); // 서명 복구
                console.log('isOwner : ', isOwner); // owner인지 확인

                if(!isOwner) return;

                const res = await axios.post('http://localhost:49832', {
                  chainId: targetNetwork.id,
                  address: to,
                  nonce: customNonce,
                  to,
                  amount,
                  data: data,
                  hash: txHash,
                  signatures: [signature],
                  signers: [recovered]
                })
                console.log(res.data);

                setTimeout(() => {
                  router.push('/pool');
                }, 2777)
              }}
            >Create</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;
