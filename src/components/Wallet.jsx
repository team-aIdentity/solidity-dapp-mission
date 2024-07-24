import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import styled from 'styled-components';

// styled
const WalletContainer = styled.div`
  position: absolute;
  right: 100px;
  display: flex; justify-content: end;
`
const WalletBox = styled.div`
    display: flex; justify-content: center; align-items: center;
    font-size: x-large;
    font-weight: bold;
    text-shadow: -2px 0px #83B4FF, 0px 2px #83B4FF, 2px 0px #83B4FF, 0px -2px #83B4FF;
    color: white;
    cursor: pointer;

    &:hover {
      transform: scale(103%);
    }
`

const WalletBtn = () => {
  const nav = useNavigate();

  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  return (
    <>
      <WalletContainer>
        {!isConnected ? (
          <WalletBox onClick={() => connect({ connector: injected() })}>
            Connect Wallet
          </WalletBox>
        ) : (
          <WalletBox onClick={() => {nav('/mypage')}}>
            MyPage
          </WalletBox>
        )}
      </WalletContainer>
    </>
  )
}

export default WalletBtn
