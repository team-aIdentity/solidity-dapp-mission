import { gql } from "@apollo/client";
import { client } from "../apollo-client";

// 추천 포스트
export const recommendPosts = await client.query({
    query: gql`
    query Publications($orderBy: ExplorePublicationsOrderByType!) {
      explorePublications(request: {
        orderBy: $orderBy,
      }) {
        items {
          ... on Post {
            stats {
              reactions
            }
            metadata {
              ... on ImageMetadataV3 {
                id
                content
                asset {
                  image {
                    optimized {
                      uri
                    }
                  }
                }
              }
              ... on TextOnlyMetadataV3 {
                id
                content
              }
            }
          }
        }
      }
    }
  `,
  variables: {
    orderBy: "TOP_REACTED",
    limit: 'TEN'
  },
})

// 추천 프로필
export const recommendProfiles = await client.query({
    query: gql`
    query ProfileRecommendations {
        profileRecommendations(request: {
            for: "0x24"
        }) {
            items {
                id
                ownedBy {
                    address
                    chainId
                }
                stats {
                    id
                    followers
                    following
                    comments
                    posts
                    mirrors
                    quotes
                    publications
                    reactions
                    reacted
                    countOpenActions
                    lensClassifierScore
                }
                metadata {
                    displayName
                }
                handle {
                    fullHandle
                }
            }
            pageInfo {
                next
                prev
            }
        }
    }
`,
})