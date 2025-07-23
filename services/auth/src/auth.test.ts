import {
  SignUpCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import { handleSignUp } from './auth';
import {
  ConflictError,
  InternalServerError,
  ValidationError,
} from '@pescador/libs';

// Mock the Cognito client from the AWS SDK
const cognitoMock = mockClient(CognitoIdentityProviderClient);

// A sample valid event to use in tests
const validEvent = {
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  }),
};

describe('handleSignUp', () => {
  it('should sign up a user successfully on the happy path', async () => {
    // Arrange: Mock a successful Cognito response
    cognitoMock.on(SignUpCommand).resolves({
      UserSub: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    });

    // Act: Call the handler
    const result = await handleSignUp(validEvent);

    // Assert: Check for the correct successful response
    expect(result.signUp).toBe(true);
    expect(result.userSub).toBeDefined();
  });

  it('should throw a ConflictError if the user already exists', async () => {
    // Arrange: Mock the specific error from Cognito
    cognitoMock.on(SignUpCommand).rejects({
      name: 'UsernameExistsException',
    });

    // Act & Assert: Ensure the correct custom error is thrown
    await expect(handleSignUp(validEvent)).rejects.toThrow(ConflictError);
  });

  it('should throw a ValidationError for an invalid password', async () => {
    // Arrange: Mock the specific error from Cognito
    cognitoMock.on(SignUpCommand).rejects({
      name: 'InvalidPasswordException',
      message: 'Password does not conform to policy.',
    });

    // Act & Assert: Ensure the correct custom error is thrown
    await expect(handleSignUp(validEvent)).rejects.toThrow(ValidationError);
  });

  it('should throw an InternalServerError for unexpected errors', async () => {
    // Arrange: Mock a generic, unexpected error
    cognitoMock.on(SignUpCommand).rejects(new Error('Something went wrong'));

    // Act & Assert: Ensure our catch-all error is thrown
    await expect(handleSignUp(validEvent)).rejects.toThrow(InternalServerError);
  });
});
