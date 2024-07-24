import React from 'react'
import styled from 'styled-components'
import Button from './Button'
import WalletBtn from './Wallet'

// styled
const NavigationContainer = styled.div`
    width: 100vw; height: 6vh;
    background-color: aliceblue;
    display: flex; justify-content: center; align-items: center;
    position: relative;
`

const Navigation = () => {

    return (
        <NavigationContainer>
            <Button text={'Posts'} path={'/'} />
            <Button text={'Profiles'} path={'/profile'} />
            <WalletBtn />
        </NavigationContainer>
    )
}

export default Navigation
