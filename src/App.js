import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LensProvider } from '@lens-protocol/react-web';

import Main from './pages/Main'
import Profile from './pages/Profile';
import SingleProfile from './pages/SingleProfile';
import { lensConfig, wagmiConfig } from './config';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyPage from './pages/MyPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LensProvider config={lensConfig}>
          <Router>
            <Routes>
              <Route path='/' element={<Main />} />
              <Route path='profile' element={<Profile />} />
              <Route path='/profile/:id' element={<SingleProfile />} />
              <Route path='/mypage' element={<MyPage />} />
            </Routes>
          </Router>
        </LensProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

