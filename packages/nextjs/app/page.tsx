"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";

import { Address, Balance, BlockieAvatar } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor, useScaffoldEventHistory, useTargetNetwork } from "~~/hooks/scaffold-eth";
import QRCode from "qrcode.react";
import TransactionDetail from "./pool/_components/TransactionDetail";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const contract = useDeployedContractInfo("MetaMultiSigWallet");
  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();

  const [visible, setVisible] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<any>([]);

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MetaMultiSigWallet",
    eventName: "ExecuteTransaction",
    fromBlock: 0n,
  })

  // 트랜잭션 데이터 파싱
  const parseTransactionData = async (tx: any) => {
    if(!contract.data) return;
    const contractInterface = new ethers.Interface(contract.data.abi);
    return contractInterface.parseTransaction({
      data: tx
    });
  }

  // 트랜잭션 이벤트 데이터 파싱 및 저장
  useEffect(() => {
    const parseTransactions = async () => {
      if (executeTransactionEvents) {
        const parsedTxs = await Promise.all(
          executeTransactionEvents.map(async (ev) => {
            const parsedTx = await parseTransactionData(ev.args.data);
            return {
              ...ev,
              parsedTx,
            };
          })
        );
        setParsedTransactions(parsedTxs);
      }
    };

    parseTransactions();
  }, [executeTransactionEvents, contract]);

  // modal 창 닫기
  const handleModalClose = () => {
    setVisible(false);
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[40%] flex flex-col items-center">
        {contract.data == undefined ? (
          <p className="text-3xl mt-14">No Wallet Existed</p>
        ) : (
          <>
            {contract.data && (
              <>
              {/* 컨트랙트 정보 */}
              <div className="text-3xl flex justify-center mb-3">Multi-Sig Wallet</div>
              <div className="flex flex-col bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-16 mb-6 space-y-3 py-14">
                <div className="flex">
                  <div className="flex flex-col gap-3">
                    <Address address={contract.data.address} />
                    <div className="flex gap-3 items-center">
                      <span className="font-bold text-m">Balance:</span>
                      <Balance address={contract.data.address} className="px-0 h-1.5 min-h-[0.375rem] text-m" />
                    </div>
                  </div>
                </div>
                {targetNetwork && (
                  <p className="my-0 text-m">
                    <span className="font-bold">Network</span>:{" "}
                    <span style={{ color: networkColor }}>{targetNetwork.name}</span>
                  </p>
                )}

                {/* QR code */}
                <QRCode value={contract.data.address} size={180} includeMargin renderAs="svg" />

              </div>
              {/* 트랜잭션 이벤트 */}
              <div className="w-[800px] p-2 mb-10 flex flex-col">
                <h2 className="font-bold text-center mb-4">Event Logs ({parsedTransactions.length})</h2>
                {parsedTransactions && parsedTransactions.map((ev: any, index: number) => {
                  return (
                    <div key={index} className="mb-2 border-2 ">
                      {/* 1열 */}
                      <div className="flex gap-20 m-2 items-center">
                        <div className="font-bold"># {Number(ev.args.nonce)}</div>
                        <div className="flex items-center">
                          <BlockieAvatar address={ev.args.hash} size={30} />
                          <div className="ml-2">{ev.args.hash.substring(0, 6)}...</div>
                        </div>
                        <div>
                          <Address address={contract.data?.address} />
                        </div>
                        <div>{Number(ev.args.value)} ETH</div>
        
                        {/* Modal 버튼 */}
                        <button
                          className="w-[80px] border-2 h-[40px] rounded-full"
                          onClick={() => {setVisible(!visible)}}
                        >...</button>
                      </div>
                      {/* 2열 */}
                      <div className="flex gap-10 m-2">
                        {ev.parsedTx &&
                        <>
                        <div>Event Name : {ev.parsedTx.fragment.name}</div>
                        <div>Addressed to : {ev.parsedTx.args[0]}</div>
                        </>
                        }
                      </div>
        
                      {/* Modal */}
                      <TransactionDetail txnInfo={ev.parsedTx} visible={visible} handleModalClose={handleModalClose} />
                      </div>
                  )
                })}
              </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
