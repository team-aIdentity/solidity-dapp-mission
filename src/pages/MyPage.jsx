import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi';
import { useLogin, useProfilesManaged } from '@lens-protocol/react-web';
import Navigation from '../components/Navigation';
import styled from 'styled-components'
import Subject from '../components/Subject';

// styled
const SingleProfileContainer = styled.div`
    width: 100vw;
    display: flex; justify-content: center; align-items: center;
    flex-wrap: wrap;
`
const WarningBox = styled.div`
    text-align: center;
`
const ProfileBox = styled.div`
    width: 1200px; height: 300px;
    border-radius: 20px;
    box-shadow: 3px 3px 5px lightgray;
    display: flex;
    overflow: hidden;
`
const ImgBox = styled.div`
  width: 300px; height: 100%;
  background-image: url(${(props) => props.backgroundImg});
  background-size: cover;
  background-position: center;
`
const DetailBox = styled.div`
  height: 100%;
  display: flex; justify-content: start; align-items: start;
  flex-direction: column;
  padding: 20px;
`
const NicknameBox = styled.div`
    color: #83B4FF;
    font-weight: bold;
    font-size: x-large;
    margin-bottom: 3px;
`
const IdBox = styled.div`
    font-weight: bold;
    margin-bottom: 5px;
`
const StatsBox = styled.div`
    width: 100%;
    display: flex; flex-direction: column;
    margin-top: 5px;
`
const OwnedByBox = styled.div`
    margin-top: 15px;
    color: gray;
`

const MyPage = () => {
    
  // 1) address 얻기
  const { address } = useAccount();
  // 2) login 하기
  const [isLogin, setIsLogin] = useState(false);
  const { execute, loading: loginLoading } = useLogin();

  // 3) profiles 얻기
  const { data: profiles, loading: profilesLoading } = useProfilesManaged({
    for: address,
    includeOwned: true,
  });

  const [myProfile, setMyProfile] = useState(null);

  // 4) 첫 번째 profile
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setMyProfile(profiles[0]);
    }
  }, [profiles]);

  const executeLogin = async () => {
    if(isLogin === true) return;
    try {
      await execute({ address: address });
      setIsLogin(true);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  useEffect(() => {
    if(myProfile) return;
    executeLogin();
  }, [myProfile])

  if(profilesLoading) return <>Loading...</>
  return (
    <>
    <Navigation />
    <SingleProfileContainer>
      <Subject text={'MyPage'} />
        {isLogin && !myProfile &&
          <WarningBox>
            {address}<br/>
            This account doesn't have any Lens profiles.
            Please make Lens profile first.
          </WarningBox>
        }
        {isLogin && myProfile &&
          <ProfileBox>
            <ImgBox backgroundImg={myProfile.metadata.picture.optimized.uri} />
            <DetailBox>
              <NicknameBox>{myProfile.metadata.displayName}</NicknameBox>
              <IdBox>{myProfile.id}</IdBox>
              <IdBox>{myProfile.metadata.bio}</IdBox>
              <StatsBox>
                <div>following: {myProfile.stats.following} followers: {myProfile.stats.followers}</div>
                <div>posts: {myProfile.stats.posts} comments: {myProfile.stats.comments} reactions: {myProfile.stats.reactions}</div>
              </StatsBox>
              <OwnedByBox>ownedBy. {myProfile.ownedBy.address}</OwnedByBox>
            </DetailBox>
          </ProfileBox>
        }
    </SingleProfileContainer>
    </>
  )
}

export default MyPage
