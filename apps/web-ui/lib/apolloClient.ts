import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://7i8t8edga8.execute-api.us-east-1.amazonaws.com/graphql',
});

const authLink = setContext((_, { headers }) => {
  let token = null;

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pescador_tokens');
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        token = tokens.IdToken || tokens.idToken || null;
      } catch (err) {
        console.error('Error parsing stored tokens:', err);
      }
    }
  }

  const authHeaders = { ...(headers || {}) };
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  return { headers: authHeaders };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;

