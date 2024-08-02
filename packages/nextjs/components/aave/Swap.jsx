import React, { useState, useEffect } from "react";

import { ethers } from "ethers";
import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@uniswap/sdk'
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { parseUnits, formatUnits } from "@ethersproject/units";
import axios from "axios";

import { useDebounce, usePoller } from "~~/hooks/aave";
import { useAccount, useBlockNumber } from "wagmi";
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

import { Space, Row, InputNumber, Card, notification, Select, Descriptions, Typography, Button, Divider, Tooltip, Drawer, Modal } from "antd";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)"
];

const makeCall = async (callName, contract, args, metadata={}) => {
  if(contract[callName]) {
    let result
    if(args) {
      result = await contract[callName](...args, metadata)
    } else {
      result = await contract[callName]()
    }
    return result
  } else {
    console.log('no call of that name!')
  }
}

let defaultToken = 'ETH'
let defaultTokenOut = 'DAI'
let defaultSlippage = '0.5'
let defaultTimeLimit = 60 * 10

const tokenListToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.symbol] = new Token(item.chainId, item.address, item.decimals, item.symbol, item.name)
     return obj
   }, {})

function Swap({ selectedProvider, tokenListURI }) {

  const account = useAccount();

  const [tokenIn, setTokenIn] = useState(defaultToken)
  const [tokenOut, setTokenOut] = useState(defaultTokenOut)
  const [exact, setExact] = useState()
  const [amountIn, setAmountIn] = useState()
  const [amountInMax, setAmountInMax] = useState()
  const [amountOut, setAmountOut] = useState()
  const [amountOutMin, setAmountOutMin] = useState()
  const [trades, setTrades] = useState()
  const [routerAllowance, setRouterAllowance] = useState()
  const [balanceIn, setBalanceIn] = useState()
  const [balanceOut, setBalanceOut] = useState()
  const [slippageTolerance, setSlippageTolerance] = useState(new Percent(Math.round(defaultSlippage*100).toString(), "10000"))
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit)
  const [swapping, setSwapping] = useState(false)
  const [approving, setApproving] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [swapModalVisible, setSwapModalVisible] = useState(false)

  const [tokenList, setTokenList] = useState([])

  const [tokens, setTokens] = useState()

  const [invertPrice, setInvertPrice] = useState(false)

  const [signer, setSigner] = useState(null);
  const [routerContract, setRouterContract] = useState(null);

  let blockNumber = useBlockNumber();

  useEffect(() => {
    const init = async () => {
      if (selectedProvider) {
        let signer = await selectedProvider.getSigner(account.address);
        let routerContract = new ethers.Contract(ROUTER_ADDRESS, IUniswapV2Router02ABI, signer);
        setSigner(signer);
        setRouterContract(routerContract);
      }
    };
    init();
  }, [selectedProvider]);

  let _tokenListUri = tokenListURI ? tokenListURI : 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

  const debouncedAmountIn = useDebounce(amountIn, 500);
  const debouncedAmountOut = useDebounce(amountOut, 500);

  const targetNetworkId = useTargetNetwork().targetNetwork.id;

  useEffect(() => {
    const getTokenList = async () => {
      try {
        let response = await axios.get('http://localhost:3333/api/tokenList');
        let tokenListJson = await JSON.parse(response.data);

        let filteredTokens = tokenListJson.tokens.filter(function (t) {
          return t.chainId === targetNetworkId
        })

        let ethToken = WETH[1]
        ethToken.name = 'Ethereum'
        ethToken.symbol = 'ETH'
        ethToken.logoURI = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"

        // https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
        let daiToken = {
          chainId: targetNetworkId,
          address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
          decimals: 18,
          symbol: "DAI",
          name: "Dai Stablecoin",
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
        }
        let linkToken = {
          chainId: targetNetworkId,
          address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
          decimals: 18,
          symbol: "LINK",
          name: "ChainLink Token",
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png"
        }
        let usdcToken = {
          chainId: targetNetworkId,
          address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
          decimals: 6,
          symbol: "USDC",
          name: "USDCoin",
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        }
        let wbtcToken = {
          chainId: targetNetworkId,
          address: "0x29f2D40B0605204364af54EC677bD022dA425d03",
          decimals: 8,
          symbol: "WBTC",
          name: "Wrapped BTC",
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
        }
        let usdtToken = {
          chainId: targetNetworkId,
          address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
          decimals: 6,
          symbol: "USDT",
          name: "Tether USD",
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
        }
        let aaveToken = {
          chainId: targetNetworkId,
          address: "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a",
          decimals: 18,
          symbol: "AAVE",
          name: "Aave",
          logoURI: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110"
        }

        if(targetNetworkId === 11155111) {
          let _tokenList = [ethToken, daiToken, linkToken, usdcToken, wbtcToken, usdtToken, aaveToken, ...filteredTokens]
          console.log(_tokenList)
          setTokenList(_tokenList)
          let _tokens = tokenListToObject(_tokenList)
          setTokens(_tokens)
        }else {
          let _tokenList = [ethToken, ...filteredTokens]
          console.log(_tokenList)
          setTokenList(_tokenList)
          let _tokens = tokenListToObject(_tokenList)
          setTokens(_tokens)
        }

      } catch (e) {
        console.log(e)
      }
    }
    getTokenList()
  },[tokenListURI])

  const getTrades = async () => {
    if(tokenIn && tokenOut && (amountIn || amountOut)) {
      console.log(tokenIn, tokenOut, amountIn, amountOut)

      let pairs = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v,w]) ).flat();

      let baseTokens = tokenList.filter(function (t) {
        return [tokenIn, tokenOut].includes(t.symbol)
      }).map((el) => {
        return new Token(el.chainId, el.address, el.decimals, el.symbol, el.name)
      })
      // let baseTokens = tokenList.filter(function (t) {
      //   return ['DAI', 'USDC', 'USDT', 'COMP', 'ETH', 'MKR', 'LINK', tokenIn, tokenOut].includes(t.symbol)
      // }).map((el) => {
      //   return new Token(el.chainId, el.address, el.decimals, el.symbol, el.name)
      // })

      let listOfPairwiseTokens = pairs(baseTokens)
      console.log(listOfPairwiseTokens)

      const getPairs = async (list) => {
        let listOfPromises = list.map(item => Fetcher.fetchPairData(item[0], item[1], selectedProvider))
        return Promise.all(listOfPromises.map(p => p.catch(() => undefined)));
      }
      let listOfPairs = await getPairs(listOfPairwiseTokens)
      console.log(listOfPairs)


      let bestTrade

      if(exact === 'in') {
        setAmountInMax()
        bestTrade = Trade.bestTradeExactIn(
          listOfPairs.filter(item => item != undefined),
          new TokenAmount(tokens[tokenIn], parseUnits(amountIn.toString()), tokens[tokenIn].decimals),
          tokens[tokenOut], { maxNumResults: 3, maxHops: 1 }
        );
        if(bestTrade[0]) {
          setAmountOut(bestTrade[0].outputAmount.toSignificant(6))
        } else { setAmountOut() }
      } else if (exact === 'out') {
        setAmountOutMin()
        bestTrade = Trade.bestTradeExactOut(
          listOfPairs.filter(item => item),
          tokens[tokenIn],
          new TokenAmount(tokens[tokenOut], parseUnits(amountOut.toString(), tokens[tokenOut].decimals)),
      { maxNumResults: 3, maxHops: 1 })
        if(bestTrade[0]) {
          setAmountIn(bestTrade[0].inputAmount.toSignificant(6))
        } else { setAmountIn() }
      }

      setTrades(bestTrade)

      console.log(bestTrade)

    }
  }

  useEffect(() => {
      getTrades()
  },[tokenIn, tokenOut, debouncedAmountIn, debouncedAmountOut, slippageTolerance, selectedProvider])

  useEffect(() => {
    if(trades && trades[0]) {
      if(exact === 'in') {
        setAmountOutMin(trades[0].minimumAmountOut(slippageTolerance))
      } else if (exact === 'out') {
        setAmountInMax(trades[0].maximumAmountIn(slippageTolerance))
      }
    }
  }, [slippageTolerance, amountIn, amountOut, trades])

  const getBalance = async (_token, _account, _contract) => {

    let newBalance
    if(_token === 'ETH') {
      newBalance = await selectedProvider.getBalance(_account)
    } else {
      newBalance = await makeCall('balanceOf', _contract, [_account])
    }
    return newBalance
  }

  const getAccountInfo = async () => {

    if(tokens) {

      let accountList = await selectedProvider.listAccounts()

      if(tokenIn) {
        let tempContractIn = new ethers.Contract(tokens[tokenIn].address, erc20Abi, selectedProvider);
        let newBalanceIn = await getBalance(tokenIn, accountList[0], tempContractIn)
        setBalanceIn(newBalanceIn)

        let allowance

        if(tokenIn === 'ETH') {
          setRouterAllowance()
        } else {
          allowance = await makeCall('allowance',tempContractIn,[accountList[0],ROUTER_ADDRESS])
          setRouterAllowance(allowance)
        }
        }

      if(tokenOut) {
        let tempContractOut = new ethers.Contract(tokens[tokenOut].address, erc20Abi, selectedProvider);
        let newBalanceOut = await getBalance(tokenOut, accountList[0], tempContractOut)
        setBalanceOut(newBalanceOut)
      }
    }
  }

  usePoller(getAccountInfo, 6000)

  let route = trades ? (trades.length > 0 ? trades[0].route.path.map(function(item) {
    return item['symbol'];
  }) : []) : []

  const updateRouterAllowance = async (newAllowance) => {
    setApproving(true)
    try {
    let tempContract = new ethers.Contract(tokens[tokenIn].address, erc20Abi, signer);
    let result = await makeCall('approve', tempContract, [ROUTER_ADDRESS, newAllowance])
    console.log(result)
    setApproving(false)
    return true
  } catch(e) {
      notification.open({
        message: 'Approval unsuccessful',
        description:
        `Error: ${e.message}`,
      });
    }
  }

  const approveRouter = async () => {
    let approvalAmount = exact === 'in' ? ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals)) : amountInMax.raw.toString()
    console.log(approvalAmount)
    let approval = updateRouterAllowance(approvalAmount)
    if(approval) {
      notification.open({
        message: 'Token transfer approved',
        description:
        `You can now swap up to ${amountIn} ${tokenIn}`,
      });
    }
  }

  const removeRouterAllowance = async () => {
    let approvalAmount = ethers.utils.hexlify(0)
    console.log(approvalAmount)
    let removal = updateRouterAllowance(approvalAmount)
    if(removal) {
      notification.open({
        message: 'Token approval removed',
        description:
        `The router is no longer approved for ${tokenIn}`,
      });
    }
  }

  const executeSwap = async () => {
    setSwapping(true)
    try {
      let args
      let metadata = {}

      let call
      let deadline = Math.floor(Date.now() / 1000) + timeLimit
      let path = trades[0].route.path.map(function(item) {
        return item['address'];
      })
      console.log(path)
      let accountList = await selectedProvider.listAccounts()
      console.log(accountList)
      let address = accountList[0]

      if (exact === 'in') {
        let _amountIn = ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals))
        let _amountOutMin = ethers.utils.hexlify(ethers.BigNumber.from(amountOutMin.raw.toString()))
        if (tokenIn === 'ETH') {
          call = 'swapExactETHForTokens'
          args = [_amountOutMin, path, address, deadline]
          metadata['value'] = _amountIn
        } else {
          call = tokenOut === 'ETH' ? 'swapExactTokensForETH' : 'swapExactTokensForTokens'
          args = [_amountIn, _amountOutMin, path, address, deadline]
        }
      } else if (exact === 'out') {
        let _amountOut = ethers.utils.hexlify(parseUnits(amountOut.toString(), tokens[tokenOut].decimals))
        let _amountInMax = ethers.utils.hexlify(ethers.BigNumber.from(amountInMax.raw.toString()))
        if (tokenIn === 'ETH') {
          call = 'swapETHForExactTokens'
          args = [_amountOut, path, address, deadline]
          metadata['value'] = _amountInMax
        } else {
          call = tokenOut === 'ETH' ? 'swapTokensForExactETH' : 'swapTokensForExactTokens'
          args = [_amountOut, _amountInMax, path, address, deadline]
        }
      }
      console.log(call, args, metadata)
      let result = await makeCall(call, routerContract, args, metadata)
      console.log(result)
      notification.open({
        message: 'Swap complete 🦄',
        description:
        <><Text>{`Swapped ${tokenIn} for ${tokenOut}, transaction: `}</Text><Text copyable>{result.hash}</Text></>,
      });
      setSwapping(false)
  } catch (e) {
    console.log(e)
    setSwapping(false)
    notification.open({
      message: 'Swap unsuccessful',
      description:
      `Error: ${e.message}`,
    });
  }
  }

  const showSwapModal = () => {
    setSwapModalVisible(true);
  };

  const handleSwapModalOk = () => {
    setSwapModalVisible(false);
    executeSwap()
  };

  const handleSwapModalCancel = () => {
    setSwapModalVisible(false);
  };

  let insufficientBalance = balanceIn ? parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)) < amountIn : null
  let inputIsToken = tokenIn !== 'ETH'
  let insufficientAllowance = !inputIsToken ? false : routerAllowance ? parseFloat(formatUnits(routerAllowance,tokens[tokenIn].decimals)) < amountIn : null
  let formattedBalanceIn = balanceIn?parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)).toPrecision(6):null
  let formattedBalanceOut = balanceOut?parseFloat(formatUnits(balanceOut,tokens[tokenOut].decimals)).toPrecision(6):null

  let metaIn = tokens && tokenList && tokenIn ? tokenList.filter(function (t) {
    return t.address === tokens[tokenIn].address
  })[0] : null
  let metaOut = tokens && tokenList && tokenOut ? tokenList.filter(function (t) {
    return t.address === tokens[tokenOut].address
    })[0] : null


  const cleanIpfsURI = (uri) => {
    try {
    return (uri).replace('ipfs://','https://ipfs.io/ipfs/')
  } catch(e) {
    console.log(e, uri)
    return uri
  }
  }

  let logoIn = metaIn?cleanIpfsURI(metaIn.logoURI):null
  let logoOut = metaOut?cleanIpfsURI(metaOut.logoURI):null

  let rawPrice = trades&&trades[0]?trades[0].executionPrice:null
  let price = rawPrice?rawPrice.toSignificant(7):null
  let priceDescription = rawPrice ? (invertPrice ? `${(rawPrice.invert()).toSignificant(7)} ${tokenIn} per ${tokenOut}` : `${price} ${tokenOut} per ${tokenIn}`) : null

  let priceWidget = (
    <Space>
    <Text type="secondary">{priceDescription}</Text>
    <Button type="text" onClick={() => {setInvertPrice(!invertPrice)}}><RetweetOutlined /></Button>
    </Space>
  )

  let swapModal = (
    <Modal title="Confirm swap" open={swapModalVisible} onOk={handleSwapModalOk} onCancel={handleSwapModalCancel}>
      <Row><Space><img src={logoIn} alt={tokenIn} width='30'/>{amountIn}{tokenIn}</Space></Row>
      <Row justify='center' align='middle' style={{width:30}}><span>↓</span></Row>
      <Row><Space><img src={logoOut} alt={tokenOut} width='30'/>{amountOut}{tokenOut}</Space></Row>
      <Divider/>
      <Row>{priceWidget}</Row>
      <Row>{trades&&(amountOutMin || amountInMax)?(exact==='in'?`Output is estimated. You will receive at least ${amountOutMin.toSignificant(6)} ${tokenOut} or the transaction will revert.`:`Input is estimated. You will sell at most ${amountInMax.toSignificant(6)} ${tokenIn} or the transaction will revert.`):null}</Row>
    </Modal>
  )

  return (
    <Card title={<Space><img src="https://ipfs.io/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg" width='40' alt='uniswapLogo'/><Typography>Uniswapper</Typography></Space>} extra={<Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>}>
    <Space direction="vertical">
    <Row justify="center" align="middle">
    <Card size="small" type="inner" title={`From${exact==='out' && tokenIn && tokenOut?' (estimate)':''}`} extra={<><img src={logoIn} alt={tokenIn} width='30'/><Button type="link" onClick={() => {
      setAmountOut()
      setAmountIn(formatUnits(balanceIn,tokens[tokenIn].decimals))
      setAmountOutMin()
      setAmountInMax()
      setExact('in')
    }}>{formattedBalanceIn}</Button></>} style={{ width: 400, textAlign: 'left' }}>
      <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amountIn} onChange={(e) => {
        setAmountOut()
        setTrades()
        setAmountIn(e)
        setExact('in')
      }}/>
      <Select showSearch value={tokenIn} style={{width: '120px'}} size={'large'} variant={false} defaultValue={defaultToken} onChange={(value) => {
        console.log(value)
        if(value===tokenOut) {
          console.log('switch!', tokenIn)
          setTokenOut(tokenIn)
          setAmountOut(amountIn)
          setBalanceOut(balanceIn)
        }
        setTokenIn(value)
        setTrades()
        setAmountIn()
        setExact('out')
        setBalanceIn()
      }} filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      } optionFilterProp="children">
      {tokenList.map(token => (
        <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
      ))}
      </Select>
    </Card>
    </Row>
    <Row justify="center" align="middle">
      <Tooltip title={route.join("->")}><span>↓</span></Tooltip>
    </Row>
    <Row justify="center" align="middle">
    <Card size="small" type="inner" title={`To${exact==='in' && tokenIn && tokenOut?' (estimate)':''}`} extra={<><img src={logoOut} width='30' alt={tokenOut}/><Button type="text">{formattedBalanceOut}</Button></>} style={{ width: 400, textAlign: 'left' }}>
      <InputNumber style={{width: '160px'}} size={'large'} min={0} value={amountOut} onChange={(e) => {
        setAmountOut(e)
        setAmountIn()
        setTrades()
        setExact('out')
      }}/>
      <Select showSearch value={tokenOut} style={{width: '120px'}} size={'large'} variant={false} onChange={(value) => {
        console.log(value, tokenIn, tokenOut)
        if(value===tokenIn) {
          console.log('switch!', tokenOut)
          setTokenIn(tokenOut)
          setAmountIn(amountOut)
          setBalanceIn(balanceOut)
        }
        setTokenOut(value)
        setExact('in')
        setAmountOut()
        setTrades()
        setBalanceOut()
      }} filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      } optionFilterProp="children">
      {tokenList.map(token => (
        <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
      ))}
      </Select>
    </Card>
    </Row>
    <Row justify="center" align="middle">
      {priceDescription?priceWidget:null}
    </Row>
    <Row justify="center" align="middle">
    <Space>
      {inputIsToken?<Button size="large" loading={approving} disabled={!insufficientAllowance} onClick={approveRouter}>{(!insufficientAllowance&&amountIn&&amountOut)?'Approved':'Approve'}</Button>:null}
      <Button size="large" loading={swapping} disabled={insufficientAllowance || insufficientBalance || !amountIn || !amountOut} onClick={showSwapModal}>{insufficientBalance?'Insufficient balance':'Swap!'}</Button>
      {swapModal}
    </Space>
    </Row>
    </Space>
    <Drawer open={settingsVisible} onClose={() => { setSettingsVisible(false) }} width={500}>
    <Descriptions title="Details" column={1} style={{textAlign: 'left'}}>
      <Descriptions.Item label="blockNumber">{blockNumber}</Descriptions.Item>
      <Descriptions.Item label="routerAllowance"><Space>{routerAllowance?formatUnits(routerAllowance,tokens[tokenIn].decimals):null}{routerAllowance>0?<Button onClick={removeRouterAllowance}>Remove Allowance</Button>:null}</Space></Descriptions.Item>
      <Descriptions.Item label="route">{route.join("->")}</Descriptions.Item>
      <Descriptions.Item label="exact">{exact}</Descriptions.Item>
      <Descriptions.Item label="bestPrice">{trades ? (trades.length > 0 ? trades[0].executionPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="nextMidPrice">{trades ? (trades.length > 0 ? trades[0].nextMidPrice.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="priceImpact">{trades ? (trades.length > 0 ? trades[0].priceImpact.toSignificant(6) : null) : null}</Descriptions.Item>
      <Descriptions.Item label="slippageTolerance">{<InputNumber
        defaultValue={defaultSlippage}
        min={0}
        max={100}
        precision={2}
        formatter={value => `${value}%`}
        parser={value => value.replace('%', '')}
        onChange={(value) => {
          console.log(value)

         let slippagePercent = new Percent(Math.round(value*100).toString(), "10000")
         setSlippageTolerance(slippagePercent)
       }}
      />}</Descriptions.Item>
      <Descriptions.Item label="amountInMax">{amountInMax?amountInMax.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="amountOutMin">{amountOutMin?amountOutMin.toExact():null}</Descriptions.Item>
      <Descriptions.Item label="timeLimitInSeconds">{<InputNumber
              min={0}
              max={3600}
              defaultValue={defaultTimeLimit}
              onChange={(value) => {
              console.log(value)
              setTimeLimit(value)
             }}
            />}</Descriptions.Item>
    </Descriptions>
    </Drawer>
    </Card>
  )

}

export default Swap;
