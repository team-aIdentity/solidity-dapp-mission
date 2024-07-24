import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Subject from '../components/Subject'
import { recommendProfiles } from '../hooks/hooks'
import styled from 'styled-components'

// styled
const ProfilesContainer = styled.div`
    width: 100vw;
    display: flex; justify-content: center; align-items: center;
    flex-wrap: wrap;
`

const ProfilesBox = styled.div`
  width: 400px; height: 160px;
  border-radius: 20px;
  box-shadow: 3px 3px 5px lightgray;
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  flex-direction: column;
  margin: 20px;

  &:hover {
    transform: scale(101%);
  }
`

const NicknameBox = styled.div`
    color: #83B4FF;
    font-weight: bold;
    font-size: large;
    margin-bottom: 3px;
`
const IdBox = styled.div`
    font-weight: bold;
    margin-bottom: 3px;
`
const StatsBox = styled.div`
    display: flex;
`

const Profile = () => {
  const nav = useNavigate();

  if(!recommendProfiles.data) return <>Loading...</>
  return (
    <>
    <Navigation />
    <ProfilesContainer>
      <Subject text={'Recommend Profiles'} />
      {recommendProfiles.data &&
        recommendProfiles.data.profileRecommendations.items.map((item, index) => {
          const nickname = item.handle.fullHandle.split("/");
          const name = item.metadata?.displayName;
          return (
              <ProfilesBox key={index} onClick={() => {nav(`/profile/${nickname[1]}`)}}>
                {name &&
                <NicknameBox>{name}</NicknameBox>
                }
                {!name &&
                <NicknameBox>{nickname}</NicknameBox>
                }
                <IdBox>{item.id}</IdBox>
                  {item.stats &&
                  <StatsBox>following: {item.stats.following} followers: {item.stats.followers}</StatsBox>
                  }
              </ProfilesBox>
          )
        })
      }
    </ProfilesContainer>
    </>
  )
}

export default Profile
