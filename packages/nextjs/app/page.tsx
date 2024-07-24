"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useReadContract } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import DiamondHeader from "~~/components/diamond/DiamondHeader";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames, getMainDiamondContract } from "~~/utils/scaffold-eth/contractsData";
import { useState, useEffect } from "react";
import { ContractUI } from "./debug/_components/contract";
import { Contract, Fragment, Interface, Signer, ethers, parseEther } from "ethers";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {

  const account = useAccount();

  const contractNames: ContractName[] = getContractNames();
  const mainDiamondContractName: ContractName | undefined = getMainDiamondContract();
  const EIP2535Names: ContractName[] = ["DiamondCutFacet", "OwnershipFacet", "DiamondLoupeFacet"];
  const facetNames: ContractName[] = contractNames.filter(
    (name: ContractName) => EIP2535Names.indexOf(name) === -1 && name !== mainDiamondContractName,
  );
  const [selectedEIP2535, setSelectedEIP2535] = useState<ContractName>(EIP2535Names[0]);
  const [selectedFacet, setSelectedFacet] = useState<ContractName>(facetNames[0]);

  // Diamond fallback

  // choice function
  const allFacetNames = [...EIP2535Names, ...facetNames];

  const [diamondContract, setDiamondContract] = useState<Contract>();
  const [diamondAddress, setDiamondAddress] = useState<string>();
  const [signer, setSigner] = useState<Signer>();

  // const [facetContract, setFacetContract] = useState<Contract>();
  // const [facetAddress, setFacetAddress] = useState<string>();
  const [facetInterface, setFacetInterface] = useState<Interface>();

  const [contractName, setContractName] = useState<string>(allFacetNames[0]);
  const [methods, setMethods] = useState<Fragment[]>();
  const [methodName, setMethodName] = useState<Fragment | undefined>();
  const [args, setArgs] = useState<any[]>([]);
  const [value, setValue] = useState<string>("0");
  const [calldata, setCalldata] = useState<string>("0x");

  const [callResult, setCallResult] = useState<any>();

  const cDiamondInit = useDeployedContractInfo("CrowdfundrDiamondInit");
  const cDiamond = useDeployedContractInfo("CrowdfundrDiamond");
  const diamondCutFacet = useDeployedContractInfo("DiamondCutFacet");
  const ownershipFacet = useDeployedContractInfo("OwnershipFacet");
  const diamondLoupeFace = useDeployedContractInfo("DiamondLoupeFacet");
  const configFacet = useDeployedContractInfo("ConfigFacet");
  const mainFacet = useDeployedContractInfo("MainFacet");
  const withdrawFacet = useDeployedContractInfo("WithdrawFacet");

  const { targetNetwork } = useTargetNetwork();
  const provider = new ethers.JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);

  // 초기 설정 (signer, diamond)
  useEffect(() => {
    const init = async () => {
      if(!cDiamond.data) return;

      const signer = await provider.getSigner(account.address);
      setSigner(signer);

      const abi = cDiamond.data.abi;
      const contract = new ethers.Contract(cDiamond.data.address, abi, signer);
      setDiamondContract(contract);
      setDiamondAddress(cDiamond.data.address);
    }
    init();
  }, [provider, signer, cDiamond])

  // Facet 설정
  const setFacet = async (contractName: string) => {
    if(!mainFacet.data || !ownershipFacet.data || !configFacet.data || !withdrawFacet.data || !diamondCutFacet.data || !diamondLoupeFace.data || !cDiamondInit.data) return;
    let abi;
    let FacetContract;
    let FacetInterface;
    let functions;

    if(contractName == "MainFacet") {
      abi = mainFacet.data.abi;
      FacetContract = new ethers.Contract(mainFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(mainFacet.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "OwnershipFacet") {
      abi = ownershipFacet.data.abi;
      FacetContract = new ethers.Contract(ownershipFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(ownershipFacet.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "ConfigFacet") {
      abi = configFacet.data.abi;
      FacetContract = new ethers.Contract(configFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(configFacet.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "WithdrawFacet") {
      abi = withdrawFacet.data.abi;
      FacetContract = new ethers.Contract(withdrawFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(withdrawFacet.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "DiamondCutFacet") {
      abi = diamondCutFacet.data.abi;
      FacetContract = new ethers.Contract(diamondCutFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(diamondCutFacet.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "DiamondLoupeFacet") {
      abi = diamondLoupeFace.data.abi;
      FacetContract = new ethers.Contract(diamondCutFacet.data.address, abi, signer);
      FacetInterface = new ethers.Interface(diamondLoupeFace.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }
    if(contractName == "CrowdfundrDiamondInit") {
      abi = cDiamondInit.data.abi;
      FacetContract = new ethers.Contract(cDiamondInit.data.address, abi, signer);
      FacetInterface = new ethers.Interface(cDiamondInit.data.abi);
      functions = FacetInterface.fragments.filter((fragment) => fragment.type === 'function');
      setMethodName(functions[0])
    }

    setFacetInterface(FacetInterface);
    setMethods(functions);
  }

  // calldata 생성
  const handleCallData = async () => {
    if(!facetInterface || !methodName) return;
    console.log(methodName.name, args)
    const calldata = facetInterface.encodeFunctionData(methodName.name, args);
    console.log(calldata);
    setCalldata(calldata);
  }

  // 트랜잭션 실행
  const setTransaction = async () => {
    const tx = {
      to: diamondAddress,
      data: calldata,
      value: parseEther(value)
    }

    const res = await signer?.sendTransaction(tx);
    console.log(res)
    if(res) {
      notification.success("send transaction is succeed")
      setArgs([]);
    }else {
      notification.error("send transaction is failed")
    }

    setArgs([]);
    setValue("0");
  }

  // view 함수 실행
  const callFallback = async () => {
    if(!facetInterface || !methodName) return;
    try {
      const result = await provider.call({
        to: diamondAddress,
        data: calldata
      })

      const decodedResult = facetInterface.decodeFunctionResult(methodName, result);
      console.log('result : ', decodedResult)
      setCallResult(decodedResult[0]);
      setArgs([]);
    } catch (error) {
      console.error(error);
    }
  }
  
  // contract 선택
  useEffect(() => {
    console.log('contractName', contractName)
    setFacet(contractName);
  }, [contractName])

  // method 선택
  useEffect(() => {
    handleCallData();
  }, [methodName, args, value])

  // 초기화
  useEffect(() => {
    setArgs([]);
    setValue("0");
    setCallResult("");
  }, [methodName, contractName])

  if(mainDiamondContractName == undefined || !cDiamond || !mainFacet) return <>Please deploy your contracts.</>

  return (
    <>
      <DiamondHeader />
      {contractNames.length === 0 ? (
          <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
            <p className="text-3xl mt-14">No contracts found!</p>
          </div>
        ) : (
          <>
            {/* 실제 트랜잭션 실행하는 곳 */}
            <div className="text-center mt-8 bg-secondary p-10 mt-0">
              <h2 className="text-4xl my-0">Diamond</h2>
              <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
                <div>
                  <h3 className="p-2 text-2xl text-center">Facet</h3>
                  <select
                    className="w-[400px] m-2 h-10 p-2 flex border-2 border-base-300 rounded-full"
                    value={contractName}
                    onChange={(e) => {setContractName(e.target.value)}}
                  >
                    {allFacetNames.map((name, index) => {
                      return (
                        <option key={index}>{name}</option>
                      )
                    })}
                  </select>

                  {contractName && methods &&
                  <>
                  <h3 className="p-2 text-2xl text-center">Method</h3>
                  <select
                    className="w-[400px] m-2 h-10 p-2 flex border-2 border-base-300 rounded-full"
                    onChange={(e) => {setMethodName(JSON.parse(e.target.value))}}
                  >
                    {methods.map((m, index) => {
                      return (
                        <option key={index} value={JSON.stringify(m)}>{m.name}</option>
                      )
                    })}
                  </select>
                  </>
                  }
                </div>
              </div>
            </div>

            {/* 트랜잭션 실행버튼 */}
            {contractName && methodName &&
            <>
            <div className="text-center p-10 mt-0">
              <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
                <div>
                  {/* inputs이 있는 경우 */}
                  {methodName.inputs.length > 0 &&
                  <>
                  <h3 className="p-2 text-2xl text-center">Arguments</h3>
                  {methodName.inputs.map((arg, index) => {
                    const placeholder = `${arg.name} (${arg.type})`;
                    return(
                      <input
                        key={index}
                        className="w-[400px] mb-10 h-10 p-2 flex border-2 border-base-300 rounded-full"
                        placeholder={placeholder}
                        value={args}
                        onChange={(e) => {
                          setArgs([e.target.value])
                        }}
                      />
                    )
                  })}
                  </>
                  }
                  {/* payable인 경우 */}
                  {methodName.payable === true &&
                  <>
                  <h3 className="p-2 text-2xl text-center">Value (ETH)</h3>
                  <input
                    className="w-[400px] mb-10 h-10 p-2 flex border-2 border-base-300 rounded-full"
                    onChange={(e) => {setValue(e.target.value)}}
                  />
                  </>
                  }

                  {methodName.stateMutability === "view" ? (
                    <button
                      className="w-[80px] border-2 h-[40px] rounded-full"
                      onClick={() => {callFallback()}}
                    >Call</button>
                  ) : (
                    <button
                      className="w-[80px] border-2 h-[40px] rounded-full"
                      onClick={() => {setTransaction()}}
                    >Send</button>
                  )}

                  {/* Call result */}
                  <div className="mt-10">
                    {callResult.toString()}
                  </div>

                </div>
              </div>
            </div>
            </>
            }


            {/* Diamond */}
            {/* <div className="text-center mt-8 bg-secondary p-10 mt-0">
              <h2 className="text-4xl my-0">Diamond Smart Contract</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <ContractUI contractName={mainDiamondContractName} />
            </div> */}

            {/* EIP-2535 Facets */}
            {/* <div className="text-center mt-8 bg-secondary p-10">
              <h2 className="text-4xl my-0">EIP-2535 Facets</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {EIP2535Names.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      contractName === selectedEIP2535 ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => setSelectedEIP2535(contractName)}
                  >
                    {contractName}
                  </button>
                ))}
              </div>
              {EIP2535Names.map(contractName => (
                <ContractUI
                  key={contractName}
                  contractName={contractName}
                  className={contractName === selectedEIP2535 ? "" : "hidden"}
                />
              ))}
            </div> */}

            {/* Facets */}
            {/* <div className="text-center mt-8 bg-secondary p-10">
              <h2 className="text-4xl my-0">Facet Contracts</h2>
            </div>
            <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {facetNames.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      contractName === selectedFacet ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => setSelectedFacet(contractName)}
                  >
                    {contractName}
                  </button>
                ))}
              </div>
              {facetNames.map(contractName => (
                <ContractUI
                  key={contractName}
                  contractName={contractName}
                  className={contractName === selectedFacet ? "" : "hidden"}
                />
              ))}
            </div> */}
          </>
        )}
    </>
  );
};

export default Home;
