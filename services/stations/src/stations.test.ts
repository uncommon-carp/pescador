// Mock environment variable before imports
const mockTableName = 'test-table';
process.env.DYNAMODB_TABLE = mockTableName;

import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  addFavoriteStation,
  removeFavoriteStation,
  getFavoriteStations,
} from './stations';
import {
  ValidationError,
  InternalServerError,
} from '@pescador/libs';

// Mock the DynamoDB client
const dynamoMock = mockClient(DynamoDBClient);

describe('Stations Service', () => {
  beforeEach(() => {
    dynamoMock.reset();
    jest.clearAllMocks();
  });

  describe('addFavoriteStation', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
        stationId: 'station-456',
        stationName: 'Test Station',
        lat: 40.7128,
        lon: -74.0060,
      }),
    };

    it('should add a favorite station successfully', async () => {
      // Arrange: Mock successful DynamoDB response
      dynamoMock.on(PutItemCommand).resolves({});

      // Act: Call the function
      const result = await addFavoriteStation(validEvent);

      // Assert: Check for successful response
      expect(result.success).toBe(true);
      expect(result.message).toBe('Station added to favorites successfully');

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        ConditionExpression: 'attribute_not_exists(userSub) AND attribute_not_exists(stationId)',
      });
    });

    it('should add a favorite station without coordinates', async () => {
      // Arrange: Event without lat/lon
      const eventWithoutCoords = {
        body: JSON.stringify({
          userSub: 'user-123',
          stationId: 'station-456',
          stationName: 'Test Station',
        }),
      };
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      const result = await addFavoriteStation(eventWithoutCoords);

      // Assert
      expect(result.success).toBe(true);
      
      // Verify null values were set for coordinates
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.lat).toBeNull();
      expect(item.lon).toBeNull();
    });

    it('should return error when station is already in favorites', async () => {
      // Arrange: Mock conditional check failure
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      dynamoMock.on(PutItemCommand).rejects(error);

      // Act
      const result = await addFavoriteStation(validEvent);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Station is already in favorites');
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({
          stationId: 'station-456',
          stationName: 'Test Station',
        }),
      };

      // Act & Assert
      await expect(addFavoriteStation(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing stationId', async () => {
      // Arrange: Event with missing stationId
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          stationName: 'Test Station',
        }),
      };

      // Act & Assert
      await expect(addFavoriteStation(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing stationName', async () => {
      // Arrange: Event with missing stationName
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
          stationId: 'station-456',
        }),
      };

      // Act & Assert
      await expect(addFavoriteStation(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError for unexpected DynamoDB errors', async () => {
      // Arrange: Mock unexpected error
      dynamoMock.on(PutItemCommand).rejects(new Error('Unexpected error'));

      // Act & Assert
      await expect(addFavoriteStation(validEvent)).rejects.toThrow(InternalServerError);
    });

    it('should set dateAdded timestamp', async () => {
      // Arrange
      const mockDate = '2024-01-15T10:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);
      dynamoMock.on(PutItemCommand).resolves({});

      // Act
      await addFavoriteStation(validEvent);

      // Assert
      const call = dynamoMock.call(0);
      const item = unmarshall((call.args[0].input as any).Item);
      expect(item.dateAdded).toBe(mockDate);
    });
  });

  describe('removeFavoriteStation', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
        stationId: 'station-456',
      }),
    };

    it('should remove a favorite station successfully', async () => {
      // Arrange: Mock successful DynamoDB response
      dynamoMock.on(DeleteItemCommand).resolves({});

      // Act
      const result = await removeFavoriteStation(validEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Station removed from favorites successfully');

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        ConditionExpression: 'attribute_exists(userSub) AND attribute_exists(stationId)',
      });
    });

    it('should return error when station was not in favorites', async () => {
      // Arrange: Mock conditional check failure
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      dynamoMock.on(DeleteItemCommand).rejects(error);

      // Act
      const result = await removeFavoriteStation(validEvent);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Station was not in favorites');
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({
          stationId: 'station-456',
        }),
      };

      // Act & Assert
      await expect(removeFavoriteStation(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing stationId', async () => {
      // Arrange: Event with missing stationId
      const invalidEvent = {
        body: JSON.stringify({
          userSub: 'user-123',
        }),
      };

      // Act & Assert
      await expect(removeFavoriteStation(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError for unexpected DynamoDB errors', async () => {
      // Arrange: Mock unexpected error
      dynamoMock.on(DeleteItemCommand).rejects(new Error('Unexpected error'));

      // Act & Assert
      await expect(removeFavoriteStation(validEvent)).rejects.toThrow(InternalServerError);
    });
  });

  describe('getFavoriteStations', () => {
    const validEvent = {
      body: JSON.stringify({
        userSub: 'user-123',
      }),
    };

    it('should return favorite stations successfully', async () => {
      // Arrange: Mock DynamoDB response with stations
      const mockItems = [
        marshall({
          userSub: 'user-123',
          stationId: 'station-456',
          stationName: 'Test Station 1',
          lat: 40.7128,
          lon: -74.0060,
          dateAdded: '2024-01-15T10:30:00.000Z',
        }),
        marshall({
          userSub: 'user-123',
          stationId: 'station-789',
          stationName: 'Test Station 2',
          lat: null,
          lon: null,
          dateAdded: '2024-01-16T11:30:00.000Z',
        }),
      ];

      dynamoMock.on(QueryCommand).resolves({
        Items: mockItems,
      } as any);

      // Act
      const result = await getFavoriteStations(validEvent);

      // Assert
      expect(result.stations).toHaveLength(2);
      expect(result.stations[0]).toEqual({
        stationId: 'station-456',
        stationName: 'Test Station 1',
        lat: 40.7128,
        lon: -74.0060,
        dateAdded: '2024-01-15T10:30:00.000Z',
      });
      expect(result.stations[1]).toEqual({
        stationId: 'station-789',
        stationName: 'Test Station 2',
        lat: undefined,
        lon: undefined,
        dateAdded: '2024-01-16T11:30:00.000Z',
      });

      // Verify DynamoDB was called with correct parameters
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input).toMatchObject({
        TableName: mockTableName,
        KeyConditionExpression: 'userSub = :userSub',
      });
    });

    it('should return empty array when user has no favorite stations', async () => {
      // Arrange: Mock empty DynamoDB response
      dynamoMock.on(QueryCommand).resolves({
        Items: [],
      } as any);

      // Act
      const result = await getFavoriteStations(validEvent);

      // Assert
      expect(result.stations).toEqual([]);
    });

    it('should handle undefined Items in response', async () => {
      // Arrange: Mock DynamoDB response with undefined Items
      dynamoMock.on(QueryCommand).resolves({} as any);

      // Act
      const result = await getFavoriteStations(validEvent);

      // Assert
      expect(result.stations).toEqual([]);
    });

    it('should throw ValidationError for missing userSub', async () => {
      // Arrange: Event with missing userSub
      const invalidEvent = {
        body: JSON.stringify({}),
      };

      // Act & Assert
      await expect(getFavoriteStations(invalidEvent)).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError for unexpected DynamoDB errors', async () => {
      // Arrange: Mock unexpected error
      dynamoMock.on(QueryCommand).rejects(new Error('Unexpected error'));

      // Act & Assert
      await expect(getFavoriteStations(validEvent)).rejects.toThrow(InternalServerError);
    });
  });

  describe('JSON parsing edge cases', () => {
    it('should handle malformed JSON in addFavoriteStation', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(addFavoriteStation(invalidEvent)).rejects.toThrow();
    });

    it('should handle malformed JSON in removeFavoriteStation', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(removeFavoriteStation(invalidEvent)).rejects.toThrow();
    });

    it('should handle malformed JSON in getFavoriteStations', async () => {
      // Arrange: Event with invalid JSON
      const invalidEvent = {
        body: 'invalid json',
      };

      // Act & Assert
      await expect(getFavoriteStations(invalidEvent)).rejects.toThrow();
    });
  });
});