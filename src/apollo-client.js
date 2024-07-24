import { ApolloClient, InMemoryCache } from '@apollo/client';

const ENDPOINT = 'https://api-v2.lens.dev';
// const TESTNET_ENDPOINT = 'https://api-v2-amoy.lens.dev';

export const client = new ApolloClient({
  uri: ENDPOINT,
  cache: new InMemoryCache(),
});