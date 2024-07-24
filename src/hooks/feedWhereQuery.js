import { gql } from "@apollo/client";

export default gql`
query feedHighlights($request: FeedHighlightsRequest!) {
    feedHighlights(request: $request) {
      items {
        ... on Post {
          id
          publishedOn {
            id
          }
          isHidden
          momoka {
            proof
          }
          txHash
          createdAt
          stats {
            id
            comments
            mirrors
            quotes
            reactions
            countOpenActions
            bookmarks
          }
          hashtagsMentioned
        }
      }
      pageInfo {
        prev
        next
      }
    }
  }
`
// export default gql`
// query feedHighlights($request: FeedHighlightsRequest!) {
//     feedHighlights(request: $request) {
//       items {
//         ... on Post {
//           id
//           publishedOn {
//             id
//           }
//           isHidden
//           momoka {
//             proof
//           }
//           txHash
//           createdAt
//           by {
//             id
//             ownedBy {
//               ...NetworkAddressFragment
//             }
//             txHash
//             createdAt
//             stats {
//               ...ProfileStatsFragment
//             }
//             operations {
//               ...ProfileOperationsFragment
//             }
//             interests
//             guardian {
//               ...ProfileGuardianResultFragment
//             }
//             invitedBy {
//               ...ProfileFragment
//             }
//             invitesLeft
//             onchainIdentity {
//               ...ProfileOnchainIdentityFragment
//             }
//             followNftAddress {
//               ...NetworkAddressFragment
//             }
//             metadata {
//               ...ProfileMetadataFragment
//             }
//             followModule {
//               ... on FeeFollowModuleSettings {
//                 ...FeeFollowModuleSettingsFragment
//               }
//               ... on RevertFollowModuleSettings {
//                 ...RevertFollowModuleSettingsFragment
//               }
//               ... on UnknownFollowModuleSettings {
//                 ...UnknownFollowModuleSettingsFragment
//               }
//             }
//             handle {
//               ...HandleInfoFragment
//             }
//             signless
//             sponsor
//             peerToPeerRecommendedByMe
//           }
//           stats {
//             id
//             comments
//             mirrors
//             quotes
//             reactions
//             countOpenActions
//             bookmarks
//           }
//           operations {
//             id
//             isNotInterested
//             hasBookmarked
//             hasReported
//             canAct
//             hasActed {
//               ...OptimisticStatusResultFragment
//             }
//             actedOn {
//               ... on KnownCollectOpenActionResult {
//                 ...KnownCollectOpenActionResultFragment
//               }
//               ... on UnknownOpenActionResult {
//                 ...UnknownOpenActionResultFragment
//               }
//             }
//             hasReacted
//             canComment
//             canMirror
//             canQuote
//             hasQuoted
//             hasMirrored
//             canDecrypt {
//               ...CanDecryptResponseFragment
//             }
//           }
//           metadata {
//             ... on VideoMetadataV3 {
//               ...VideoMetadataV3Fragment
//             }
//             ... on ImageMetadataV3 {
//               ...ImageMetadataV3Fragment
//             }
//             ... on AudioMetadataV3 {
//               ...AudioMetadataV3Fragment
//             }
//             ... on ArticleMetadataV3 {
//               ...ArticleMetadataV3Fragment
//             }
//             ... on EventMetadataV3 {
//               ...EventMetadataV3Fragment
//             }
//             ... on LinkMetadataV3 {
//               ...LinkMetadataV3Fragment
//             }
//             ... on EmbedMetadataV3 {
//               ...EmbedMetadataV3Fragment
//             }
//             ... on CheckingInMetadataV3 {
//               ...CheckingInMetadataV3Fragment
//             }
//             ... on TextOnlyMetadataV3 {
//               ...TextOnlyMetadataV3Fragment
//             }
//             ... on ThreeDMetadataV3 {
//               ...ThreeDMetadataV3Fragment
//             }
//             ... on StoryMetadataV3 {
//               ...StoryMetadataV3Fragment
//             }
//             ... on TransactionMetadataV3 {
//               ...TransactionMetadataV3Fragment
//             }
//             ... on MintMetadataV3 {
//               ...MintMetadataV3Fragment
//             }
//             ... on SpaceMetadataV3 {
//               ...SpaceMetadataV3Fragment
//             }
//             ... on LiveStreamMetadataV3 {
//               ...LiveStreamMetadataV3Fragment
//             }
//           }
//           isEncrypted
//           openActionModules {
//             ... on SimpleCollectOpenActionSettings {
//               ...SimpleCollectOpenActionSettingsFragment
//             }
//             ... on MultirecipientFeeCollectOpenActionSettings {
//               ...MultirecipientFeeCollectOpenActionSettingsFragment
//             }
//             ... on LegacyFreeCollectModuleSettings {
//               ...LegacyFreeCollectModuleSettingsFragment
//             }
//             ... on LegacyFeeCollectModuleSettings {
//               ...LegacyFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyLimitedFeeCollectModuleSettings {
//               ...LegacyLimitedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyLimitedTimedFeeCollectModuleSettings {
//               ...LegacyLimitedTimedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyRevertCollectModuleSettings {
//               ...LegacyRevertCollectModuleSettingsFragment
//             }
//             ... on LegacyTimedFeeCollectModuleSettings {
//               ...LegacyTimedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyMultirecipientFeeCollectModuleSettings {
//               ...LegacyMultirecipientFeeCollectModuleSettingsFragment
//             }
//             ... on LegacySimpleCollectModuleSettings {
//               ...LegacySimpleCollectModuleSettingsFragment
//             }
//             ... on LegacyERC4626FeeCollectModuleSettings {
//               ...LegacyERC4626FeeCollectModuleSettingsFragment
//             }
//             ... on LegacyAaveFeeCollectModuleSettings {
//               ...LegacyAaveFeeCollectModuleSettingsFragment
//             }
//             ... on UnknownOpenActionModuleSettings {
//               ...UnknownOpenActionModuleSettingsFragment
//             }
//           }
//           referenceModule {
//             ... on LegacyFollowOnlyReferenceModuleSettings {
//               ...LegacyFollowOnlyReferenceModuleSettingsFragment
//             }
//             ... on FollowOnlyReferenceModuleSettings {
//               ...FollowOnlyReferenceModuleSettingsFragment
//             }
//             ... on UnknownReferenceModuleSettings {
//               ...UnknownReferenceModuleSettingsFragment
//             }
//             ... on LegacyDegreesOfSeparationReferenceModuleSettings {
//               ...LegacyDegreesOfSeparationReferenceModuleSettingsFragment
//             }
//             ... on DegreesOfSeparationReferenceModuleSettings {
//               ...DegreesOfSeparationReferenceModuleSettingsFragment
//             }
//           }
//           profilesMentioned {
//             profile {
//               ...ProfileFragment
//             }
//             snapshotHandleMentioned {
//               ...HandleInfoFragment
//             }
//             stillOwnsHandle
//           }
//           hashtagsMentioned
//         }
//         ... on Quote {
//           id
//           publishedOn {
//             id
//           }
//           isHidden
//           momoka {
//             proof
//           }
//           txHash
//           createdAt
//           by {
//             id
//             ownedBy {
//               ...NetworkAddressFragment
//             }
//             txHash
//             createdAt
//             stats {
//               ...ProfileStatsFragment
//             }
//             operations {
//               ...ProfileOperationsFragment
//             }
//             interests
//             guardian {
//               ...ProfileGuardianResultFragment
//             }
//             invitedBy {
//               ...ProfileFragment
//             }
//             invitesLeft
//             onchainIdentity {
//               ...ProfileOnchainIdentityFragment
//             }
//             followNftAddress {
//               ...NetworkAddressFragment
//             }
//             metadata {
//               ...ProfileMetadataFragment
//             }
//             followModule {
//               ... on FeeFollowModuleSettings {
//                 ...FeeFollowModuleSettingsFragment
//               }
//               ... on RevertFollowModuleSettings {
//                 ...RevertFollowModuleSettingsFragment
//               }
//               ... on UnknownFollowModuleSettings {
//                 ...UnknownFollowModuleSettingsFragment
//               }
//             }
//             handle {
//               ...HandleInfoFragment
//             }
//             signless
//             sponsor
//             peerToPeerRecommendedByMe
//           }
//           stats {
//             id
//             comments
//             mirrors
//             quotes
//             reactions
//             countOpenActions
//             bookmarks
//           }
//           operations {
//             id
//             isNotInterested
//             hasBookmarked
//             hasReported
//             canAct
//             hasActed {
//               ...OptimisticStatusResultFragment
//             }
//             actedOn {
//               ... on KnownCollectOpenActionResult {
//                 ...KnownCollectOpenActionResultFragment
//               }
//               ... on UnknownOpenActionResult {
//                 ...UnknownOpenActionResultFragment
//               }
//             }
//             hasReacted
//             canComment
//             canMirror
//             canQuote
//             hasQuoted
//             hasMirrored
//             canDecrypt {
//               ...CanDecryptResponseFragment
//             }
//           }
//           metadata {
//             ... on VideoMetadataV3 {
//               ...VideoMetadataV3Fragment
//             }
//             ... on ImageMetadataV3 {
//               ...ImageMetadataV3Fragment
//             }
//             ... on AudioMetadataV3 {
//               ...AudioMetadataV3Fragment
//             }
//             ... on ArticleMetadataV3 {
//               ...ArticleMetadataV3Fragment
//             }
//             ... on EventMetadataV3 {
//               ...EventMetadataV3Fragment
//             }
//             ... on LinkMetadataV3 {
//               ...LinkMetadataV3Fragment
//             }
//             ... on EmbedMetadataV3 {
//               ...EmbedMetadataV3Fragment
//             }
//             ... on CheckingInMetadataV3 {
//               ...CheckingInMetadataV3Fragment
//             }
//             ... on TextOnlyMetadataV3 {
//               ...TextOnlyMetadataV3Fragment
//             }
//             ... on ThreeDMetadataV3 {
//               ...ThreeDMetadataV3Fragment
//             }
//             ... on StoryMetadataV3 {
//               ...StoryMetadataV3Fragment
//             }
//             ... on TransactionMetadataV3 {
//               ...TransactionMetadataV3Fragment
//             }
//             ... on MintMetadataV3 {
//               ...MintMetadataV3Fragment
//             }
//             ... on SpaceMetadataV3 {
//               ...SpaceMetadataV3Fragment
//             }
//             ... on LiveStreamMetadataV3 {
//               ...LiveStreamMetadataV3Fragment
//             }
//           }
//           isEncrypted
//           openActionModules {
//             ... on SimpleCollectOpenActionSettings {
//               ...SimpleCollectOpenActionSettingsFragment
//             }
//             ... on MultirecipientFeeCollectOpenActionSettings {
//               ...MultirecipientFeeCollectOpenActionSettingsFragment
//             }
//             ... on LegacyFreeCollectModuleSettings {
//               ...LegacyFreeCollectModuleSettingsFragment
//             }
//             ... on LegacyFeeCollectModuleSettings {
//               ...LegacyFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyLimitedFeeCollectModuleSettings {
//               ...LegacyLimitedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyLimitedTimedFeeCollectModuleSettings {
//               ...LegacyLimitedTimedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyRevertCollectModuleSettings {
//               ...LegacyRevertCollectModuleSettingsFragment
//             }
//             ... on LegacyTimedFeeCollectModuleSettings {
//               ...LegacyTimedFeeCollectModuleSettingsFragment
//             }
//             ... on LegacyMultirecipientFeeCollectModuleSettings {
//               ...LegacyMultirecipientFeeCollectModuleSettingsFragment
//             }
//             ... on LegacySimpleCollectModuleSettings {
//               ...LegacySimpleCollectModuleSettingsFragment
//             }
//             ... on LegacyERC4626FeeCollectModuleSettings {
//               ...LegacyERC4626FeeCollectModuleSettingsFragment
//             }
//             ... on LegacyAaveFeeCollectModuleSettings {
//               ...LegacyAaveFeeCollectModuleSettingsFragment
//             }
//             ... on UnknownOpenActionModuleSettings {
//               ...UnknownOpenActionModuleSettingsFragment
//             }
//           }
//           referenceModule {
//             ... on LegacyFollowOnlyReferenceModuleSettings {
//               ...LegacyFollowOnlyReferenceModuleSettingsFragment
//             }
//             ... on FollowOnlyReferenceModuleSettings {
//               ...FollowOnlyReferenceModuleSettingsFragment
//             }
//             ... on UnknownReferenceModuleSettings {
//               ...UnknownReferenceModuleSettingsFragment
//             }
//             ... on LegacyDegreesOfSeparationReferenceModuleSettings {
//               ...LegacyDegreesOfSeparationReferenceModuleSettingsFragment
//             }
//             ... on DegreesOfSeparationReferenceModuleSettings {
//               ...DegreesOfSeparationReferenceModuleSettingsFragment
//             }
//           }
//           profilesMentioned {
//             profile {
//               ...ProfileFragment
//             }
//             snapshotHandleMentioned {
//               ...HandleInfoFragment
//             }
//             stillOwnsHandle
//           }
//           hashtagsMentioned
//           quoteOn {
//             ... on Post {
//               ...PostFragment
//             }
//             ... on Comment {
//               ...CommentFragment
//             }
//             ... on Quote {
//               ...QuoteFragment
//             }
//           }
//         }
//       }
//       pageInfo {
//         prev
//         next
//       }
//     }
//   }
  
// `
