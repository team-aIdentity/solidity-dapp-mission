"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support";

const thegraph_api_key = process.env.NEXT_PUBLIC_THEGRAPH_API;

function makeClient() {
  const httpLink = new HttpLink({
    // v2 ethereum
    // uri: `https://gateway-arbitrum.network.thegraph.com/api/${thegraph_api_key}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`,
    // v3 ethereum
    // uri: `https://gateway-arbitrum.network.thegraph.com/api/${thegraph_api_key}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g`,
    // v3 sepolia
    uri: `https://gateway-arbitrum.network.thegraph.com/api/${thegraph_api_key}/subgraphs/id/CvTeB7ja6sz9MdmHd2GjVPRgEDh6U5MFTZ5jkGA5Hcf9`,
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

export function ApolloWrapper({ children }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}