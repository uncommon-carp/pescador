import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  ServiceCreateUserProfileInput as CreateUserProfileInput,
  ServiceUpdateUserProfileInput as UpdateUserProfileInput,
  ServiceGetUserProfileInput as GetUserProfileInput,
  ServiceProfileOperationResult,
  ServiceGetUserProfileResult as GetUserProfileResult,
  ServiceUserProfile,
  ServiceDashboardPreferences as DashboardPreferences,
  InternalServerError,
  ValidationError,
  validateUserOwnership,
} from '@pescador/libs';

const client = new DynamoDBClient({ region: 'us-east-1' });
const tableName = process.env.DYNAMODB_TABLE;

const defaultDashboardPreferences: DashboardPreferences = {
  favoriteStationsOrder: [],
  dashboardStationLimit: 5,
  displayUnits: 'imperial',
};

export async function createUserProfile(event: { body: string }) {
  try {
    const input: CreateUserProfileInput = JSON.parse(event.body);
    
    if (!input.userSub || !input.idToken) {
      throw new ValidationError('userSub and idToken are required');
    }

    // Validate that the token belongs to the user
    await validateUserOwnership(input.idToken, input.userSub);

    const now = new Date().toISOString();
    const profile: ServiceUserProfile = {
      userSub: input.userSub,
      email: input.email,
      zipCode: input.zipCode,
      dashboardPreferences: {
        ...defaultDashboardPreferences,
        ...input.dashboardPreferences,
      },
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(profile),
      ConditionExpression: 'attribute_not_exists(userSub)',
    });

    await client.send(command);

    const result: ServiceProfileOperationResult = {
      success: true,
      message: 'User profile created successfully',
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      const result: ServiceProfileOperationResult = {
        success: false,
        message: 'User profile already exists',
      };
      return result;
    }

    throw new InternalServerError(
      'profiles-create-001',
      error as Error,
    );
  }
}

export async function updateUserProfile(event: { body: string }) {
  try {
    const input: UpdateUserProfileInput = JSON.parse(event.body);
    
    if (!input.userSub || !input.idToken) {
      throw new ValidationError('userSub and idToken are required');
    }

    // Validate that the token belongs to the user
    await validateUserOwnership(input.idToken, input.userSub);

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (input.email !== undefined) {
      updateExpressions.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = input.email;
    }

    if (input.zipCode !== undefined) {
      updateExpressions.push('#zipCode = :zipCode');
      expressionAttributeNames['#zipCode'] = 'zipCode';
      expressionAttributeValues[':zipCode'] = input.zipCode;
    }

    if (input.dashboardPreferences !== undefined) {
      updateExpressions.push('#dashboardPreferences = :dashboardPreferences');
      expressionAttributeNames['#dashboardPreferences'] = 'dashboardPreferences';
      expressionAttributeValues[':dashboardPreferences'] = input.dashboardPreferences;
    }

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: marshall({ userSub: input.userSub }),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ConditionExpression: 'attribute_exists(userSub)',
    });

    await client.send(command);

    const result: ServiceProfileOperationResult = {
      success: true,
      message: 'User profile updated successfully',
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      const result: ServiceProfileOperationResult = {
        success: false,
        message: 'User profile does not exist',
      };
      return result;
    }

    throw new InternalServerError(
      'profiles-update-001',
      error as Error,
    );
  }
}

export async function getUserProfile(event: { body: string }) {
  try {
    const input: GetUserProfileInput = JSON.parse(event.body);
    
    if (!input.userSub || !input.idToken) {
      throw new ValidationError('userSub and idToken are required');
    }

    // Validate that the token belongs to the user
    await validateUserOwnership(input.idToken, input.userSub);

    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall({ userSub: input.userSub }),
    });

    const response = await client.send(command);
    
    let profile: ServiceUserProfile | null = null;
    if (response.Item) {
      const unmarshalled = unmarshall(response.Item);
      profile = {
        userSub: unmarshalled.userSub,
        email: unmarshalled.email,
        zipCode: unmarshalled.zipCode,
        dashboardPreferences: unmarshalled.dashboardPreferences || defaultDashboardPreferences,
        createdAt: unmarshalled.createdAt,
        updatedAt: unmarshalled.updatedAt,
      };
    }

    const result: GetUserProfileResult = {
      profile,
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new InternalServerError(
      'profiles-get-001',
      error as Error,
    );
  }
}