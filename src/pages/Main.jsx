import React from 'react'
import Navigation from '../components/Navigation'
import Subject from '../components/Subject';
import styled from 'styled-components';
import { recommendPosts } from '../hooks/hooks';

// styled
const PostContainer = styled.div`
    width: 100vw;
    display: flex; justify-content: center; align-items: center;
    flex-direction: column;
`

const PostBox = styled.div`
    width: 1000px; height: 300px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    margin: 20px;
    box-shadow: 3px 3px 5px lightgray;
`

const ItemContent = styled.div`
    width: 600px; height: 100%;
    box-sizing: border-box;
    position: relative;
    padding: 30px;
    overflow: scroll;

    & .content {
        width: 100%;
        font-size: large;
    }

    & .writer {
        width: 100%;
        border: 1px solid;
        position: absolute;
        right: 0; bottom: 0;
        text-align: end;
        box-sizing: border-box;
        color: gray;
    }
`

const ItemImg = styled.div`
    background-image: url(${(props) => props.backgroundImg});
    width: 400px;
    height: 100%;
    background-size: cover;
    background-position: center;
`

const Main = () => {
  if(!recommendPosts.data) return <>Loading...</>
  return (
    <>
      <Navigation />
      <PostContainer>
        <Subject text={'Recommend Posts'} />
        {recommendPosts.data && recommendPosts.data.explorePublications.items.map((item, index) => {
            if(item.__typename === "Post") {
                const imgUri = item.metadata.asset?.image?.optimized?.uri;
                return (
                    <PostBox key={index}>
                        <ItemContent>
                            <div className='content'>{item.metadata.content}</div>
                        </ItemContent>
                        {imgUri &&
                        <ItemImg backgroundImg={imgUri} />
                        }
                    </PostBox>
                )
            }
        })}
        </PostContainer>
    </>
  )
}

export default Main
