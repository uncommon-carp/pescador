import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const tableName = process.env.USER_PROFILE_TABLE_NAME;

/**
 * Cognito Post-Confirmation trigger handler.
 * Creates an initial user profile when a user confirms their email.
 */
export async function handler(event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> {
  console.log('Post-confirmation triggered for user:', event.request.userAttributes.sub);

  try {
    // Only create profile for new sign-ups, not for forgot password confirmations
    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
      const now = new Date().toISOString();
      
      const userProfile = {
        userSub: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
        // Note: zipCode is omitted - user can set this later
        dashboardPreferences: {
          favoriteStationsOrder: [],
          dashboardStationLimit: 5,
          displayUnits: 'imperial',
        },
        createdAt: now,
        updatedAt: now,
      };

      const command = new PutItemCommand({
        TableName: tableName,
        Item: marshall(userProfile, { removeUndefinedValues: true }),
        ConditionExpression: 'attribute_not_exists(userSub)', // Don't overwrite if exists
      });

      await dynamoClient.send(command);
      console.log('User profile created successfully for:', event.request.userAttributes.sub);
    }
  } catch (error) {
    // Log error but don't fail the confirmation process
    console.error('Failed to create user profile:', error);
    // If profile already exists (ConditionalCheckFailedException), that's fine
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      console.log('User profile already exists, skipping creation');
    }
  }

  // Return the event unchanged to continue the Cognito flow
  return event;
}