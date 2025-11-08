import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { PostConfirmationTriggerEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  AuthenticationError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
  publishEvent,
} from '@pescador/libs';

// --- Client and Constants ---
const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
const ClientId = process.env.PESCADOR_COGNITO_APP_ID;

// --- Response Helper ---
const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: JSON.stringify(body),
});

const handleError = (error: any): APIGatewayProxyResult => {
  console.error('Lambda error:', error);
  
  if (error instanceof ValidationError) {
    return createResponse(400, { error: error.message });
  }
  if (error instanceof AuthenticationError) {
    return createResponse(401, { error: error.message });
  }
  if (error instanceof NotFoundError) {
    return createResponse(404, { error: error.message });
  }
  if (error instanceof ConflictError) {
    return createResponse(409, { error: error.message });
  }
  if (error instanceof InternalServerError) {
    return createResponse(500, { error: error.message, traceId: error.traceId });
  }
  
  return createResponse(500, { error: 'An unexpected error occurred' });
};

// --- Authentication Handlers ---

/**
 * Creates a new user with a UUID as the username and email as an attribute.
 * Returns the user's UUID (`userSub`) upon successful initiation.
 */
export async function handleSignUp(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { email, password, name } = JSON.parse(event.body);

    const command = new SignUpCommand({
      ClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'name', Value: name },
        { Name: 'email', Value: email },
      ],
    });
    const resp = await client.send(command);
    
    return createResponse(200, {
      signUp: true,
      userSub: resp.UserSub, // Return the UUID to the client
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'UsernameExistsException') {
        return handleError(new ConflictError('An account with this email already exists.'));
      }
      if (error.name === 'InvalidPasswordException') {
        return handleError(new ValidationError(error.message)); // Use Cognito's specific message
      }
    }
    return handleError(new InternalServerError(
      '08b64313-4b7e-4357-b265-bd48fd19e9a2',
      error as Error,
    ));
  }
}

/**
 * Confirms a user's account with a code.
 * The client MUST provide the UUID received from the signUp response as the 'username'.
 */
export async function handleConfirmSignUp(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { username, code } = JSON.parse(event.body);

    const command = new ConfirmSignUpCommand({
      ClientId,
      Username: username,
      ConfirmationCode: code,
    });
    await client.send(command);
    return createResponse(200, { confirmSignUp: true });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === 'CodeMismatchException' ||
        error.name === 'ExpiredCodeException'
      ) {
        return handleError(new ValidationError(
          'The confirmation code is invalid or has expired.',
        ));
      }
      if (error.name === 'UserNotFoundException') {
        return handleError(new NotFoundError('This user does not exist.'));
      }
    }
    return handleError(new InternalServerError(
      '6adc29ee-5778-4b34-a255-bb8753383f76',
      error as Error,
    ));
  }
}

/**
 * Authenticates a user with their email and password.
 * Cognito handles the email -> UUID alias mapping for sign-in.
 */
export async function handleSignIn(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { email, password } = JSON.parse(event.body);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId,
      AuthParameters: {
        USERNAME: email, // User provides their email to sign in
        PASSWORD: password,
      },
    });
    const response = await client.send(command);

    if (response.AuthenticationResult) {
      return createResponse(200, {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      });
    }
    // This case should ideally not be reached, but provides a fallback
    return handleError(new AuthenticationError('Sign in failed for an unknown reason.'));
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === 'NotAuthorizedException' ||
        error.name === 'UserNotConfirmedException'
      ) {
        return handleError(new AuthenticationError('Incorrect username or password.'));
      }
      if (error.name === 'UserNotFoundException') {
        return handleError(new NotFoundError('This user does not exist.'));
      }
    }
    return handleError(new InternalServerError(
      '1bbc9552-0b38-4ff0-baf0-bfb3888d8e18',
      error as Error,
    ));
  }
}

/**
 * Signs out a user globally using their access token.
 */
export async function handleSignOut(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { accessToken } = JSON.parse(event.body);
    if (!accessToken) {
      return handleError(new ValidationError('AccessToken must be provided.'));
    }

    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await client.send(command);
    return createResponse(200, { signOut: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthorizedException') {
      return handleError(new AuthenticationError(
        'The access token is invalid or has been revoked.',
      ));
    }
    return handleError(new InternalServerError(
      'd5894bd1-f476-409e-844b-62aa0aa2da74',
      error as Error,
    ));
  }
}

/**
 * A Cognito trigger that fires after a user is successfully confirmed.
 * This is where you can create a corresponding user profile in your own database.
 */
export async function postConfirmation(event: PostConfirmationTriggerEvent) {
  try {
    const { email, name } = event.request.userAttributes;
    const { userName: userSub } = event; // In post-confirmation, userName is the user's UUID (sub)

    await publishEvent('pescador.auth', 'UserConfirmed', {
      userSub,
      email,
      name,
    });
  } catch (error) {
    console.error('Error in postConfirmation trigger: ', error);
    // Re-throwing the error tells Cognito the trigger failed
    throw error;
  }

  // Cognito requires you to return the event object
  return event;
}

export async function handleRefreshToken(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    const { refreshToken } = JSON.parse(event.body);

    if (!refreshToken) {
      return handleError(new ValidationError('RefreshToken must be provided.'));
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await client.send(command);

    if (response.AuthenticationResult) {
      return createResponse(200, {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        // Note: Cognito typically doesn't return a new refresh token unless it's close to expiring
        // The existing refresh token remains valid
        ...(response.AuthenticationResult.RefreshToken && {
          refreshToken: response.AuthenticationResult.RefreshToken,
        }),
      });
    }

    return handleError(new AuthenticationError(
      'Token refresh failed for an unknown reason.',
    ));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAuthorizedException') {
        return handleError(new AuthenticationError(
          'The refresh token is invalid or has expired.',
        ));
      }
      if (error.name === 'UserNotFoundException') {
        return handleError(new NotFoundError('This user does not exist.'));
      }
    }
    return handleError(new InternalServerError(
      'a7f8c9d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
      error as Error,
    ));
  }
}
