import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create the HTTP link
const httpLink = createHttpLink({
  uri: 'https://7i8t8edga8.execute-api.us-east-1.amazonaws.com/',
});

// Create the auth link to add the authorization header
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  let token = null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pescador_tokens');
    if (stored) {
      const tokens = JSON.parse(stored);
      token = tokens.idToken;
    }
  }

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token || '',
    }
  };
});

// This configures the Apollo Client to connect to your GraphQL endpoint.
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
