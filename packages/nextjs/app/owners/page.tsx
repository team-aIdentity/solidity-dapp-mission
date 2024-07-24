"use client"

import { ethers } from "ethers";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldEventHistory, useScaffoldWriteContract, useDeployedContractInfo, useScaffoldContract } from "~~/hooks/scaffold-eth";

const Owners: NextPage = () => {
  const router = useRouter();

  // 트랜잭션을 위한 정보
  const [methodName, setMethodName] = useLocalStorage("method", "addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner", "");
  const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSigNum", "");
  const [data, setData] = useLocalStorage("data", "0x");
  const [to, setTo] = useLocalStorage("to", "");
  const [amount, setAmount] = useLocalStorage("amount", "0");

  const contract = useDeployedContractInfo("MetaMultiSigWallet");

  const { data: signaturesRequiredBigint } = useScaffoldReadContract({
    contractName: "MetaMultiSigWallet",
    functionName: "signaturesRequired",
    watch: true,
  })

  const { data: owners } = useScaffoldEventHistory({
    contractName: "MetaMultiSigWallet",
    eventName: "Owner",
    fromBlock: 0n
  })

  if(!signaturesRequiredBigint) return <>Loading...</>
  if(!owners) return <>There is no owner</>

  const signaturesRequired = Number(signaturesRequiredBigint);

  return (
    <>
      <div className="flex flex-col items-center">
        <h2 className="mt-20 mb-10">Signatures Required: {signaturesRequired}</h2>

        {/* owner list */}
        <div className="border-2 p-2 mb-10 flex flex-col">
          {owners && owners.map((owner, index) => {
            return (
              <div key={index} className="flex gap-10 m-2">
                <Address address={owner.args.owner} />
                {owner.args.added ?
                  (<div className="text-cyan-500">ADDED</div>) : (<div className="text-red-500">REMOVED</div>)
                }
              </div>
            )
          })}
        </div>

        {/* choice function */}
        <div className="flex flex-col border-2 p-2 gap-3">
          <div className="m-2">
            <h3 className="p-2 text-center">Method</h3>
            <select
              className="w-[400px] m-2 h-10 p-2 text-center bg-inherit flex border-2 border-base-300 bg-base-200 rounded-full"
              value={methodName}
              onChange={(e) => {
                setMethodName(e.target.value)
              }}
            >
              <option>addSigner</option>
              <option>removeSigner</option>
            </select>
          </div>
          <div className="m-2">
            <h3 className="p-2 text-center">New Owner</h3>
            <AddressInput
              placeholder="new owner address"
              value={newOwner}
              onChange={setNewOwner}
            />
          </div>
          <div className="m-2">
            <h3 className="p-2 text-center">New Signatures Required</h3>
            <input
              className="w-[400px] m-2 h-10 p-3 bg-inherit flex border-2 border-base-300 bg-base-200 rounded-full"
              placeholder="new # of signatures required"
              value={newSignaturesRequired}
              onChange={(e) => {setNewSignaturesRequired(e.target.value)}}
            />
          </div>
          <div className="m-3 flex justify-center">
            <button
              className="w-[100px] h-[40px] bg-sky-500 rounded-full"
              onClick={() => {
                if(!contract.data || !newOwner || !newSignaturesRequired) return;
                console.log("method: ", methodName, newOwner, newSignaturesRequired);
                const contractInterface = new ethers.Interface(contract.data.abi);
                let calldata = contractInterface.encodeFunctionData(methodName, [newOwner, newSignaturesRequired]);
                console.log("calldata: ", calldata);

                setData(calldata);
                setAmount("0");
                setTo(contract.data.address);
                setTimeout(() => {
                  router.push('/create');
                }, 777)
              }}
            >Create Tx</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Owners;
