import { useQuery } from '@apollo/client'
import React from 'react'
import feedWhereQuery from '../hooks/feedWhereQuery'
import styled from 'styled-components'
import Subject from './Subject'

// styled
const FeedContainer = styled.div`
    width: 1200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
`
const FeedBox = styled.div`
    width: 400px; height: 180px;
    border: 2px solid #83B4FF;
    border-radius: 20px;
    display: flex; justify-content: center; align-items: center;
    flex-direction: column;

    & .feed-id {
        font-weight: bold;
    }
`

const Feed = ({user_id}) => {

    // const {loading, error, data} = useQuery(feedWhereQuery, {
    //     variables: {request: {
    //         limit: "Ten",
    //         where: {
    //             for: user_id
    //         }
    //     }},
    // })

    // if(error) return <>{error}</>;

    return (
        <>
        <Subject text={'Highlights'} />
        <FeedContainer>
            {/* {data?.feedHighlights?.items && data.feedHighlights.items.map((item, index) => {
                if(item.__typename == "Post") {
                    const dateObj = new Date(item.createdAt);
                    const year = dateObj.getUTCFullYear();
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    return (
                        <FeedBox key={index}>
                            <div className='feed-id'>{item.id}</div>
                            <div>Date: {year}-{month}-{day}</div>
                            <div>bookmarks: {item.stats.bookmarks} comments: {item.stats.comments} reactions: {item.stats.reactions}</div>
                        </FeedBox>
                    )
                } */}
            {/* })} */}
        </FeedContainer>
        </>
    )
}

export default Feed
