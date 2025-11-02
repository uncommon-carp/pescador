'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
}