import { gql } from "@apollo/client"

export default gql`
query Challenge($request: ChallengeRequest!) {
  challenge(request: $request) {
    id
    text
  }
}
`