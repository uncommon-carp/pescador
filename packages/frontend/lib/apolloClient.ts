import { ApolloClient, InMemoryCache } from '@apollo/client';

// This configures the Apollo Client to connect to your GraphQL endpoint.
const client = new ApolloClient({
  uri: 'https://ju290im7m8.execute-api.us-east-1.amazonaws.com/',
  cache: new InMemoryCache(),
});

export default client;
