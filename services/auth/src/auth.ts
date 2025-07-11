import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { v4 as uuid, v4 as traceId } from 'uuid';
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

// --- API Gateway Event Handler Types ---
interface AuthEvent {
  body: string;
}

// --- Authentication Handlers ---

/**
 * Creates a new user with a UUID as the username and email as an attribute.
 * Returns the user's UUID (`userSub`) upon successful initiation.
 */
export async function handleSignUp(event: AuthEvent) {
  const { email, password, name } = JSON.parse(event.body);
  const username = uuid();

  try {
    const command = new SignUpCommand({
      ClientId,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'name', Value: name },
        { Name: 'email', Value: email },
      ],
    });
    const resp = await client.send(command);
    return {
      signUp: true,
      userSub: resp.UserSub, // Return the UUID to the client
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'UsernameExistsException') {
        throw new ConflictError('An account with this email already exists.');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new ValidationError(error.message); // Use Cognito's specific message
      }
    }
    throw new InternalServerError(traceId(), error as Error);
  }
}

/**
 * Confirms a user's account with a code.
 * The client MUST provide the UUID received from the signUp response as the 'username'.
 */
export async function handleConfirmSignUp(event: AuthEvent) {
  const { username, code } = JSON.parse(event.body);

  try {
    const command = new ConfirmSignUpCommand({
      ClientId,
      Username: username,
      ConfirmationCode: code,
    });
    await client.send(command);
    return { confirmSignUp: true };
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === 'CodeMismatchException' ||
        error.name === 'ExpiredCodeException'
      ) {
        throw new ValidationError(
          'The confirmation code is invalid or has expired.',
        );
      }
      if (error.name === 'UserNotFoundException') {
        throw new NotFoundError('This user does not exist.');
      }
    }
    throw new InternalServerError(traceId(), error as Error);
  }
}

/**
 * Authenticates a user with their email and password.
 * Cognito handles the email -> UUID alias mapping for sign-in.
 */
export async function handleSignIn(event: AuthEvent) {
  const { email, password } = JSON.parse(event.body);

  try {
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
      return {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
    }
    // This case should ideally not be reached, but provides a fallback
    throw new AuthenticationError('Sign in failed for an unknown reason.');
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === 'NotAuthorizedException' ||
        error.name === 'UserNotConfirmedException'
      ) {
        throw new AuthenticationError('Incorrect username or password.');
      }
      if (error.name === 'UserNotFoundException') {
        throw new NotFoundError('This user does not exist.');
      }
    }
    throw new InternalServerError(traceId(), error as Error);
  }
}

/**
 * Signs out a user globally using their access token.
 */
export async function handleSignOut(event: AuthEvent) {
  const { accessToken } = JSON.parse(event.body);
  if (!accessToken) {
    throw new ValidationError('AccessToken must be provided.');
  }

  try {
    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await client.send(command);
    return { signOut: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotAuthorizedException') {
      throw new AuthenticationError(
        'The access token is invalid or has been revoked.',
      );
    }
    throw new InternalServerError(traceId(), error as Error);
  }
}

/**
 * A Cognito trigger that fires after a user is successfully confirmed.
 * This is where you can create a corresponding user profile in your own database.
 */
export async function postConfirmation(event: PostConfirmationTriggerEvent) {
  console.log('PostConfirmation Trigger:', event);

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
