import { gql } from "@apollo/client"

export default gql`
query profile($request: ProfileRequest!) {
    profile(request: $request) {
        id
        ownedBy {
            address
            chainId
        }
        txHash
        createdAt
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
        operations {
            id
            isBlockedByMe {
                value
                isFinalisedOnchain
            }
            hasBlockedMe {
                value
                isFinalisedOnchain
            }
            isFollowedByMe {
                value
                isFinalisedOnchain
            }
            isFollowingMe {
                value
                isFinalisedOnchain
            }
            canBlock
            canUnblock
            canFollow
            canUnfollow
        }
        interests
        invitesLeft
        followNftAddress {
            address
            chainId
        }
        metadata {
            displayName
            bio
            rawURI
            appId
            attributes {
                type
                key
                value
            }
        }
        handle {
            id
            fullHandle
            namespace
            localName
            suggestedFormatted {
                full
                localName
            }
            linkedTo {
                contract {
                address
                chainId
                }
                nftTokenId
            }
            ownedBy
            guardian {
                protected
                cooldownEndsOn
            }
        }
        signless
        sponsor
        peerToPeerRecommendedByMe
    }
}
`