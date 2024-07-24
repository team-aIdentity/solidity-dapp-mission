import { ApolloClient, InMemoryCache } from "@apollo/client";

// 배포한 서브그래프의 uri
const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

export default client;