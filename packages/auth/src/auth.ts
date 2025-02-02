import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuid } from 'uuid';

const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

const ClientId = process.env.PESCADOR_COGNITO_APP_ID;

interface AuthEvent {
  body: string;
}

export async function handleSignUp(event: AuthEvent) {
  console.log({ event });
  const { email, password, name } = JSON.parse(event.body);

  try {
    const resp = await client.send(
      new SignUpCommand({
        ClientId,
        Username: uuid(),
        Password: password,
        UserAttributes: [
          { Name: 'name', Value: name },
          { Name: 'email', Value: email },
        ],
      }),
    );
    console.log({ resp });
    return {
      signUp: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        signUp: false,
        error: { type: error.name, message: error.message },
      };
    }
    throw new Error('Unhandled error');
  }
}

export async function handleConfirmSignUp(event: AuthEvent) {
  const { email, code } = JSON.parse(event.body);

  try {
    const command = new ConfirmSignUpCommand({
      ClientId,
      Username: email,
      ConfirmationCode: code,
    });

    await client.send(command);

    return { confirmSignUp: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        confirmSignUp: false,
        error: { type: error.name, message: error.message },
      };
    }
    throw new Error('Unhandled error');
  }
}

// export const postConfirmation = async (event: AuthEvent) => {
//   console.log('PostConfirmation: ', event);
//
//   try {
//     const {
//       email,
//       name,
//       'custom:userType': userType,
//     } = event.request.userAttributes;
//     const { userName } = event;
//
//     await publishEvent('auth.postConfirmation', 'UserConfirmed', {
//       email,
//       name,
//       userType,
//       userName,
//     });
//   } catch (error) {
//     console.error('Error creating user profile: ', error);
//     throw error;
//   }
//
//   return event;
// };

export async function handleSignIn(event: AuthEvent) {
  const { email, password } = JSON.parse(event.body);

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId,
      AuthParameters: {
        USERNAME: email,
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
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function handleSignOut(event: AuthEvent) {
  const { accessToken } = JSON.parse(event.body);
  const params = {
    AccessToken: accessToken,
  };

  try {
    const command = new GlobalSignOutCommand(params);
    await client.send(command);
    return { signOut: true };
  } catch (error) {
    console.error('Error during global sign-out:', error);
    throw error;
  }
}
