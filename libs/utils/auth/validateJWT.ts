import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';
import { AuthenticationError } from '@pescador/libs';

interface CognitoJwtPayload extends jwt.JwtPayload {
  sub: string;
  token_use: 'id' | 'access';
  aud?: string;
  client_id?: string;
}

const COGNITO_REGION = 'us-east-1';
const COGNITO_USER_POOL_ID = process.env.PESCADOR_COGNITO_USER_POOL_ID;
const COGNITO_APP_CLIENT_ID = process.env.PESCADOR_COGNITO_APP_ID;

if (!COGNITO_USER_POOL_ID) {
  throw new Error('PESCADOR_COGNITO_USER_POOL_ID environment variable is required');
}

if (!COGNITO_APP_CLIENT_ID) {
  throw new Error('PESCADOR_COGNITO_APP_ID environment variable is required');
}

const jwksUri = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

const client = jwksClient({
  jwksUri,
  requestHeaders: {},
  timeout: 30000,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

function getKey(header: jwt.JwtHeader, callback: jwt.GetPublicKeyOrSecret) {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key!.getPublicKey();
    callback(null, signingKey);
  });
}

export async function validateJWT(token: string): Promise<string> {
  if (!token) {
    throw new AuthenticationError('Authentication token is required');
  }

  // Remove 'Bearer ' prefix if present
  const cleanToken = token.replace(/^Bearer\s+/, '');

  return new Promise((resolve, reject) => {
    jwt.verify(cleanToken, getKey, {
      algorithms: ['RS256'],
      audience: COGNITO_APP_CLIENT_ID,
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
    }, (err, decoded) => {
      if (err) {
        reject(new AuthenticationError('Invalid or expired token'));
        return;
      }

      const payload = decoded as CognitoJwtPayload;
      
      if (!payload.sub) {
        reject(new AuthenticationError('Token missing user subject'));
        return;
      }

      // Ensure this is an ID token (contains user info) not just an access token
      if (payload.token_use !== 'id') {
        reject(new AuthenticationError('ID token required'));
        return;
      }

      resolve(payload.sub);
    });
  });
}

export async function validateUserOwnership(token: string, expectedUserSub: string): Promise<void> {
  const tokenUserSub = await validateJWT(token);
  
  if (tokenUserSub !== expectedUserSub) {
    throw new AuthenticationError('Token does not match the specified user');
  }
}