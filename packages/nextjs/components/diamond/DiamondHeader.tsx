import React from 'react'
import { IoDiamondOutline } from "react-icons/io5";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from '~~/utils/scaffold-eth';
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getMainDiamondContract } from '~~/utils/scaffold-eth/contractsData';

const DiamondHeader = () => {
    const mainDiamondContractName: ContractName | undefined = getMainDiamondContract();
    const configuredNetwork = getTargetNetworks();
    const networkColor = useNetworkColor();

    if(mainDiamondContractName === undefined) return <>Please deploy your contracts.</>

    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(mainDiamondContractName);

    if(deployedContractLoading) return <>Loading...</>

    return (
        <div className="min-h-0 p-5 mb-11 lg:mb-0">
        <div className="flex">
          <div className="fixed flex items-center w-full z-20 p-4 px-8 lg:px-14 top-20 right-0 pointer-events-none justify-start">
            <div className="flex space-x-2 pointer-events-auto flex-col bg-base-100 px-6 lg:px-8 py-4 items-start text-center rounded-3xl">
              <span className="text-sm flex flex-row items-center">
                <span className="mr-2">
                  {" "}
                  <IoDiamondOutline />{" "}
                </span>
                Diamond Smart Contract
              </span>
              <span className="font-bold">{mainDiamondContractName}</span>
              <Address address={deployedContractLoading ? "..." : deployedContractData?.address} />
              <div className="flex gap-1 items-center">
                <span className="font-bold text-sm">Balance:</span>
                <Balance address={deployedContractData?.address} className="px-0 h-1.5 min-h-[0.375rem]" />
              </div>
              {configuredNetwork && (
                <p className="my-0 text-sm">
                  <span className="font-bold">Network</span>:{" "}
                  <span style={{ color: networkColor }}>{configuredNetwork[0].name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
}

export default DiamondHeader
