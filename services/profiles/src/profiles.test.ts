// Mock environment variable before imports
const mockTableName = 'test-profiles-table';
process.env.DYNAMODB_TABLE = mockTableName;

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from './profiles';
import {
  ValidationError,
  InternalServerError,
} from '@pescador/libs';

// Mock the DynamoDB client
const dynamoMock = mockClient(DynamoDBClient);

describe('Profiles Service', () => {
  beforeEach(() => {
    dynamoMock.reset();
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
        email: 'test@example.com',
        zipCode: '12345',
        dashboardPreferences: {
          favoriteStationsOrder: ['station-1', 'station-2'],
          dashboardStationLimit: 5,
          displayUnits: 'imperial',
        },
        idToken: 'valid-token',
      }),
    };

    it('should create a user profile successfully', async () => {
      // Arrange: Mock successful DynamoDB response
      dynamoMock.on(PutItemCommand).resolves({});

      // Act: Call the function
      const result = await createUserProfile(validEvent);

      // Assert: Check for successful response
      expect(result.success).toBe(true);
      expect(result.message).toBe('User profile created successfully');

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        ConditionExpression: 'attribute_not_exists(userSub)',
      });
    });

    it('should create a user profile with minimal data', async () => {
      // Arrange: Event with only required fields
      const minimalEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          idToken: 'valid-token',
        }),
      };
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      const result = await createUserProfile(minimalEvent);

      // Assert
      expect(result.success).toBe(true);
      
      // Verify default preferences were set
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.dashboardPreferences).toEqual({
        favoriteStationsOrder: [],
        dashboardStationLimit: 5,
        displayUnits: 'imperial',
      });
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
    });

    it('should return error when user profile already exists', async () => {
      // Arrange: Mock conditional check failure
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      dynamoMock.on(PutItemCommand).rejects(error);

      // Act
      const result = await createUserProfile(validEvent);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('User profile already exists');
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({
          email: 'test@example.com',
          idToken: 'valid-token',
        }),
      };

      // Act & Assert
      await expect(createUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing idToken', async () => {
      // Arrange: Event with missing idToken
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          email: 'test@example.com',
        }),
      };

      // Act & Assert
      await expect(createUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError for unexpected DynamoDB errors', async () => {
      // Arrange: Mock unexpected error
      dynamoMock.on(PutItemCommand).rejects(new Error('Unexpected error'));

      // Act & Assert
      await expect(createUserProfile(validEvent)).rejects.toThrow(InternalServerError);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      // Arrange
      const mockDate = '2024-01-15T10:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      await createUserProfile(validEvent);

      // Assert
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.createdAt).toBe(mockDate);
      expect(item.updatedAt).toBe(mockDate);
    });
  });

  describe('updateUserProfile', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
        email: 'updated@example.com',
        zipCode: '54321',
        dashboardPreferences: {
          favoriteStationsOrder: ['station-3', 'station-4'],
          dashboardStationLimit: 3,
          displayUnits: 'metric',
        },
        idToken: 'valid-token',
      }),
    };

    it('should update a user profile successfully', async () => {
      // Arrange: Mock successful DynamoDB response
      dynamoMock.on(UpdateItemCommand).resolves({});

      // Act
      const result = await updateUserProfile(validEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('User profile updated successfully');

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        ConditionExpression: 'attribute_exists(userSub)',
      });
    });

    it('should update only specified fields', async () => {
      // Arrange: Event with only email update
      const partialEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          email: 'newemail@example.com',
          idToken: 'valid-token',
        }),
      };
      dynamoMock.on(UpdateItemCommand).resolves({});

      // Act
      await updateUserProfile(partialEvent);

      // Assert
      const call = dynamoMock.call(0);
      const updateExpression = (call.args[0].input as any).UpdateExpression;
      expect(updateExpression).toContain('#email = :email');
      expect(updateExpression).toContain('#updatedAt = :updatedAt');
      expect(updateExpression).not.toContain('#zipCode');
      expect(updateExpression).not.toContain('#dashboardPreferences');
    });

    it('should return error when user profile does not exist', async () => {
      // Arrange: Mock conditional check failure
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      dynamoMock.on(UpdateItemCommand).rejects(error);

      // Act
      const result = await updateUserProfile(validEvent);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('User profile does not exist');
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({
          email: 'test@example.com',
          idToken: 'valid-token',
        }),
      };

      // Act & Assert
      await expect(updateUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing idToken', async () => {
      // Arrange: Event with missing idToken
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          email: 'test@example.com',
        }),
      };

      // Act & Assert
      await expect(updateUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should always update updatedAt timestamp', async () => {
      // Arrange
      const mockDate = '2024-01-15T10:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
      dynamoMock.on(UpdateItemCommand).resolves({});

      // Act
      await updateUserProfile(validEvent);

      // Assert
      const call = dynamoMock.call(0);
      const expressionAttributeValues = unmarshall((call.args[0].input as any).ExpressionAttributeValues);
      expect(expressionAttributeValues[':updatedAt']).toBe(mockDate);
    });
  });

  describe('getUserProfile', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
        idToken: 'valid-token',
      }),
    };

    it('should return user profile successfully', async () => {
      // Arrange: Mock DynamoDB response with profile
      const mockProfile = {
        userSub: 'user-123',
        email: 'test@example.com',
        zipCode: '12345',
        dashboardPreferences: {
          favoriteStationsOrder: ['station-1', 'station-2'],
          dashboardStationLimit: 5,
          displayUnits: 'imperial',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-16T11:30:00.000Z',
      };

      dynamoMock.on(GetItemCommand).resolves({
        Item: marshall(mockProfile),
      } as any);

      // Act
      const result = await getUserProfile(validEvent);

      // Assert
      expect(result.profile).toEqual(mockProfile);

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        Key: marshall({ userSub: 'user-123' }),
      });
    });

    it('should return null when user profile does not exist', async () => {
      // Arrange: Mock empty DynamoDB response
      dynamoMock.on(GetItemCommand).resolves({} as any);

      // Act
      const result = await getUserProfile(validEvent);

      // Assert
      expect(result.profile).toBeNull();
    });

    it('should handle profile with missing optional fields', async () => {
      // Arrange: Mock profile with only required fields
      const minimalProfile = {
        userSub: 'user-123',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-16T11:30:00.000Z',
      };

      dynamoMock.on(GetItemCommand).resolves({
        Item: marshall(minimalProfile),
      } as any);

      // Act
      const result = await getUserProfile(validEvent);

      // Assert
      expect(result.profile).toEqual({
        userSub: 'user-123',
        email: undefined,
        zipCode: undefined,
        dashboardPreferences: {
          favoriteStationsOrder: [],
          dashboardStationLimit: 5,
          displayUnits: 'imperial',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-16T11:30:00.000Z',
      });
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({
          idToken: 'valid-token',
        }),
      };

      // Act & Assert
      await expect(getUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing idToken', async () => {
      // Arrange: Event with missing idToken
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
        }),
      };

      // Act & Assert
      await expect(getUserProfile(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError for unexpected DynamoDB errors', async () => {
      // Arrange: Mock unexpected error
      dynamoMock.on(GetItemCommand).rejects(new Error('Unexpected error'));

      // Act & Assert
      await expect(getUserProfile(validEvent)).rejects.toThrow(InternalServerError);
    });
  });

  describe('JSON parsing edge cases', () => {
    it('should handle malformed JSON in createUserProfile', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(createUserProfile(invalidEvent)).rejects.toThrow();
    });

    it('should handle malformed JSON in updateUserProfile', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(updateUserProfile(invalidEvent)).rejects.toThrow();
    });

    it('should handle malformed JSON in getUserProfile', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(getUserProfile(invalidEvent)).rejects.toThrow();
    });
  });

  describe('Dashboard preferences handling', () => {
    it('should merge custom preferences with defaults', async () => {
      // Arrange: Event with partial preferences
      const eventWithPartialPrefs = {
        body: JSON.stringify({
          userSub: 'user-123',
          dashboardPreferences: {
            favoriteStationsOrder: ['station-1'],
            // Missing dashboardStationLimit and displayUnits
          },
          idToken: 'valid-token',
        }),
      };
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      await createUserProfile(eventWithPartialPrefs);

      // Assert
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.dashboardPreferences).toEqual({
        favoriteStationsOrder: ['station-1'],
        dashboardStationLimit: 5, // default
        displayUnits: 'imperial', // default
      });
    });

    it('should handle empty preferences object', async () => {
      // Arrange: Event with empty preferences
      const eventWithEmptyPrefs = {
        body: JSON.stringify({
          userSub: 'user-123',
          dashboardPreferences: {},
          idToken: 'valid-token',
        }),
      };
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      await createUserProfile(eventWithEmptyPrefs);

      // Assert
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.dashboardPreferences).toEqual({
        favoriteStationsOrder: [],
        dashboardStationLimit: 5,
        displayUnits: 'imperial',
      });
    });
  });
});