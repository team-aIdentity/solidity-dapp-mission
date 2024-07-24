import React from 'react'
import { useParams } from 'react-router-dom'
import { useProfile } from '@lens-protocol/react-web'
import Navigation from '../components/Navigation'
import styled from 'styled-components'

// styled
const SingleProfileContainer = styled.div`
    width: 100vw;
    display: flex; justify-content: center; align-items: center;
    flex-wrap: wrap;
`

const ProfileBox = styled.div`
    width: 1200px; height: 300px;
    border-radius: 20px;
    box-shadow: 3px 3px 5px lightgray;
    display: flex;
    margin-top: 80px;
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

const SingleProfile = () => {
  const param = useParams();

  const { loading, error, data } = useProfile({
    forHandle: `lens/${param.id}`
  })

  if(loading) return 'Loading...';
  if(error) return 'error';
  return (
    <>
    <Navigation />
    <SingleProfileContainer>
      <ProfileBox>
        <ImgBox backgroundImg={data.metadata.picture.optimized.uri}></ImgBox>
        <DetailBox>
          <NicknameBox>{data.metadata.displayName}</NicknameBox>
          <IdBox>{data.id}</IdBox>
          <IdBox>{data.metadata.bio}</IdBox>
          <StatsBox>
            <div>following: {data.stats.following} followers: {data.stats.followers}</div>
            <div>posts: {data.stats.posts} comments: {data.stats.comments} reactions: {data.stats.reactions}</div>
          </StatsBox>
          <OwnedByBox>ownedBy. {data.ownedBy.address}</OwnedByBox>
        </DetailBox>
      </ProfileBox>

    </SingleProfileContainer>
    </>
  )
}

export default SingleProfile
