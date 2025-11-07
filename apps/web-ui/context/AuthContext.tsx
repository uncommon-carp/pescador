'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  userSub: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ userSub: string }>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens?.idToken) {
        // Check if token is expired
        if (isTokenExpired(tokens.idToken)) {
          console.log('Token expired, clearing stored tokens');
          clearStoredTokens();
          setUser(null);
        } else {
          const userData = parseJWT(tokens.idToken);
          setUser({
            email: userData.email,
            name: userData.name,
            userSub: userData.sub,
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      clearStoredTokens();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign in failed');
      }

      const { idToken, accessToken, refreshToken } = await response.json();
      storeTokens({ idToken, accessToken, refreshToken });
      
      const userData = parseJWT(idToken);
      setUser({
        email: userData.email,
        name: userData.name,
        userSub: userData.sub,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      const { userSub } = await response.json();
      return { userSub };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Confirmation failed');
      }
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokens.accessToken }),
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) throw new Error('No refresh token');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const newTokens = await response.json();
      storeTokens({ ...tokens, ...newTokens });
    } catch (error) {
      console.error('Token refresh error:', error);
      clearStoredTokens();
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions
function getStoredTokens() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('pescador_tokens');
  return stored ? JSON.parse(stored) : null;
}

function storeTokens(tokens: { idToken: string; accessToken: string; refreshToken: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pescador_tokens', JSON.stringify(tokens));
}

function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pescador_tokens');
}

function parseJWT(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token);
    if (!payload.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    // Consider token expired if it expires in less than 1 minute
    // Smaller buffer since we now have 24-hour tokens
    const bufferTime = 1 * 60 * 1000; // 1 minute in milliseconds

    return currentTime >= (expirationTime - bufferTime);
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
}
