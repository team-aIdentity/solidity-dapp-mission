import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { usePoller } from "~~/hooks/aave";
import { useQuery, gql } from '@apollo/client';
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IPriceOracle } from './abis/PriceOracle.json'
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export function useAaveData({ selectedProvider, signer, markets }) {

  let POOL_ADDRESSES_PROVIDER_ADDRESS
  let PROTOCOL_DATA_PROVIDER
  let LENDING_POOL

  const { targetNetwork } = useTargetNetwork();

  if (targetNetwork.name==='Sepolia') {
    // Sepolia V3
    POOL_ADDRESSES_PROVIDER_ADDRESS = '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A'
    PROTOCOL_DATA_PROVIDER = '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31'
    LENDING_POOL = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'
  } else {
    // Ethereum V3
    // POOL_ADDRESSES_PROVIDER_ADDRESS = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'
    // PROTOCOL_DATA_PROVIDER = '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3'
    // LENDING_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'

    // Ethereum V2
    POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
    PROTOCOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d'
    LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
  }

  const [userConfiguration, setUserConfiguration] = useState()
  const [userAccountData, setUserAccountData] = useState()
  const [userAssetData, setUserAssetData] = useState({})
  const [userAssetList, setUserAssetList] = useState({})

  const [reserveTokens, setReserveTokens] = useState()

  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);

  const contracts = { addressProviderContract, dataProviderContract, lendingPoolContract }

  const RESERVE_GRAPHQL = `
  {
      pool (id: "${POOL_ADDRESSES_PROVIDER_ADDRESS.toLowerCase()}"){
        id
        reserves {
          id
          underlyingAsset
          symbol
          name
          decimals
          usageAsCollateralEnabled
          borrowingEnabled
          stableBorrowRateEnabled
          isActive
          isFrozen
          price {
            priceInEth
          }
          totalLiquidity
          totalATokenSupply
          availableLiquidity
          liquidityRate
          variableBorrowRate
          stableBorrowRate
        }
      }
    }
  `

  const RESERVE_GQL = gql(RESERVE_GRAPHQL)
  const { data } = useQuery(RESERVE_GQL,{pollInterval: 6000});
  console.log(data);

/*
  const getReserveData = async () => {
    if(reserveTokens) {
      console.log('getting reserve data')
      reserveTokens.forEach(async (asset) => {
        if(!markets || markets.includes(asset.symbol) ) {
        let _reserveData = await dataProviderContract.getReserveData(asset.tokenAddress)
        let _reserveConfigurationData = await dataProviderContract.getReserveConfigurationData(asset.tokenAddress)
        let _newAssetData = {}
        _newAssetData[asset.symbol] = {...asset, ..._reserveData, ..._reserveConfigurationData}
        setAssetData(assetData => {
          return {...assetData, ..._newAssetData}})
          }
      })
    }
  }


  useEffect(() => {
    getReserveData()
    getPriceData()
  }, [reserveTokens])


  const getPriceData = async () => {
    if(reserveTokens) {
      console.log('getting price data')
      let assetAddresses = reserveTokens.map(a => a.tokenAddress)
      let prices = await priceOracleContract.getAssetsPrices(assetAddresses)
      let _assetPrices = {}
      for (let i = 0; i < prices.length; i++) {
        let _symbol = reserveTokens[i]['symbol']
        _assetPrices[_symbol] = prices[i]
      }
      setAssetPrices(_assetPrices)
    }
  }
*/
  const checkUserConfiguration = async (_configuration) => {
    if(_configuration && reserveTokens) {
      let configBits = parseInt(userConfiguration.toString(), 10).toString(2)
      let reversedBits = configBits.split("").reverse()
      let _userAssetList = {}
      for (let i = 0; i < reversedBits.length; i++) {
        let _assetIndex = Math.floor(i/2)
        if(reversedBits[i]==="1") {
          let _type = i%2===0?"debt":"collateral"
          let _symbol = reserveTokens[_assetIndex]['symbol']
          let _newAsset
          if(_userAssetList[_symbol]){
            _newAsset = [..._userAssetList[_symbol], _type]
          } else { _newAsset = [_type]}
          _userAssetList[_symbol] = _newAsset
        }
      }
      setUserAssetList(_userAssetList)
    }
  }

  useEffect(() => {
    checkUserConfiguration(userConfiguration)
  }, [userConfiguration])

  const getUserAssetData = async () => {
    if(userAssetList && reserveTokens) {
      let address = await signer.getAddress()
      if(Object.keys(userAssetList).length === 0) {
        setUserAssetData({})
        return
      }

      Object.keys(userAssetList).forEach(async (asset) => {

        var _assetInfo = reserveTokens.filter(function (el) {
          return el.symbol === asset})

        let _asset = {}
        let _data
        _data = await dataProviderContract.getUserReserveData(_assetInfo[0].tokenAddress,address)
        _asset[asset] = _data

        setUserAssetData(userAssetData => {
          let filteredUserAssetData = Object.keys(userAssetData)
            .filter(key => Object.keys(userAssetList).includes(key))
            .reduce((obj, key) => {
              return {
                ...obj,
                [key]: userAssetData[key]
              };
            }, {});
          return {...filteredUserAssetData, ..._asset}})

      })
      }
    }

  useEffect(() => {
    getUserAssetData()
  },[userAssetList])

  const getUserInfo = async () => {
    console.log('getting user info')
    let address = await signer.getAddress()
    let _accountData = await lendingPoolContract.getUserAccountData(address)
    setUserAccountData(_accountData)
    let _userConfiguration = await lendingPoolContract.getUserConfiguration(address)
    setUserConfiguration(_userConfiguration)
  }

  const getReserveTokens = async () => {
    if(!reserveTokens && dataProviderContract && selectedProvider) {
      console.log('getting Reserve Tokens')
      let _reserveTokens = await dataProviderContract.getAllReservesTokens()//.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(_reserveTokens)
      setReserveTokens(_reserveTokens)
    }
  }

  usePoller(getReserveTokens, 3000)
  //usePoller(getReserveData, 15000)
  //usePoller(getPriceData, 25000)
  usePoller(getUserInfo, 6000)
  usePoller(getUserAssetData, 9000)

  return { reserveTokens, assetData: data?data.pool?.reserves:[], userAccountData, userConfiguration,  userAssetList, userAssetData, contracts }

}
