import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

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

// Error handling link to catch authentication errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check for authentication errors
      if (
        err.message.includes('Invalid or expired token') ||
        err.message.includes('Authentication token is required') ||
        err.message.includes('Token') ||
        err.extensions?.code === 'UNAUTHENTICATED'
      ) {
        console.error('Authentication error detected, clearing tokens');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pescador_tokens');
          // Reload the page to reset auth state
          window.location.reload();
        }
      }
    }
  }

  if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
    console.error('401 Unauthorized, clearing tokens');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pescador_tokens');
      window.location.reload();
    }
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;

