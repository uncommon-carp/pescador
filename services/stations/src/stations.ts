import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  ServiceAddFavoriteStationInput,
  ServiceRemoveFavoriteStationInput,
  GetFavoriteStationsInput,
  ServiceStationOperationResult,
  GetFavoriteStationsResult,
  InternalServerError,
  ValidationError,
} from '@pescador/libs';

const client = new DynamoDBClient({ region: 'us-east-1' });
const tableName = process.env.DYNAMODB_TABLE;

export async function addFavoriteStation(event: { body: string }) {
  try {
    const input: ServiceAddFavoriteStationInput = JSON.parse(event.body);
    
    if (!input.userSub || !input.stationId || !input.stationName) {
      throw new ValidationError('userSub, stationId, and stationName are required');
    }

    const item = {
      userSub: input.userSub,
      stationId: input.stationId,
      stationName: input.stationName,
      lat: input.lat ?? null,
      lon: input.lon ?? null,
      dateAdded: new Date().toISOString(),
    };

    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
      ConditionExpression: 'attribute_not_exists(userSub) AND attribute_not_exists(stationId)',
    });

    await client.send(command);

    const result: ServiceStationOperationResult = {
      success: true,
      message: 'Station added to favorites successfully',
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      const result: ServiceStationOperationResult = {
        success: false,
        message: 'Station is already in favorites',
      };
      return result;
    }

    throw new InternalServerError(
      'stations-add-favorite-001',
      error as Error,
    );
  }
}

export async function removeFavoriteStation(event: { body: string }) {
  try {
    const input: ServiceRemoveFavoriteStationInput = JSON.parse(event.body);
    
    if (!input.userSub || !input.stationId) {
      throw new ValidationError('userSub and stationId are required');
    }

    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall({
        userSub: input.userSub,
        stationId: input.stationId,
      }),
      ConditionExpression: 'attribute_exists(userSub) AND attribute_exists(stationId)',
    });

    await client.send(command);

    const result: ServiceStationOperationResult = {
      success: true,
      message: 'Station removed from favorites successfully',
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      const result: ServiceStationOperationResult = {
        success: false,
        message: 'Station was not in favorites',
      };
      return result;
    }

    throw new InternalServerError(
      'stations-remove-favorite-001',
      error as Error,
    );
  }
}

export async function getFavoriteStations(event: { body: string }) {
  try {
    const input: GetFavoriteStationsInput = JSON.parse(event.body);
    
    if (!input.userSub) {
      throw new ValidationError('userSub is required');
    }

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'userSub = :userSub',
      ExpressionAttributeValues: marshall({
        ':userSub': input.userSub,
      }),
    });

    const response = await client.send(command);
    
    const stations = (response.Items || []).map((item: any) => {
      const unmarshalled = unmarshall(item);
      return {
        stationId: unmarshalled.stationId,
        stationName: unmarshalled.stationName,
        lat: unmarshalled.lat ?? undefined,
        lon: unmarshalled.lon ?? undefined,
        dateAdded: unmarshalled.dateAdded,
      };
    });

    const result: GetFavoriteStationsResult = {
      stations,
    };

    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new InternalServerError(
      'stations-get-favorites-001',
      error as Error,
    );
  }
}