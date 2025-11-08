import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

interface ServiceFunction<TInput, TOutput> {
  serviceName: string;
  functionName: string;
  input: TInput;
  output: TOutput;
}

// Map function names to environment variable keys
const FUNCTION_ARN_MAP: Record<string, string> = {
  'createUserProfile': 'CREATE_PROFILE_FUNCTION_ARN',
  'updateUserProfile': 'UPDATE_PROFILE_FUNCTION_ARN',
  'getUserProfile': 'GET_PROFILE_FUNCTION_ARN',
  'getWeatherByZip': 'GET_WEATHER_BY_ZIP_FUNCTION_ARN',
  'getStationsByBox': 'GET_STATIONS_BY_BOX_FUNCTION_ARN',
  'getStationById': 'GET_STATION_BY_ID_FUNCTION_ARN',
  'addFavoriteStation': 'ADD_FAVORITE_STATION_FUNCTION_ARN',
  'removeFavoriteStation': 'REMOVE_FAVORITE_STATION_FUNCTION_ARN',
  'getFavoriteStations': 'GET_FAVORITE_STATIONS_FUNCTION_ARN',
  'getFavoriteStationsOrdered': 'GET_FAVORITE_STATIONS_ORDERED_FUNCTION_ARN',
};

export const invokeServiceFunction = async <
  T extends ServiceFunction<unknown, unknown>,
>(
  serviceName: T['serviceName'],
  functionName: T['functionName'],
  input: T['input'],
): Promise<T['output']> => {
  const client = new LambdaClient({ region: 'us-east-1' });

  // Get function ARN from environment variable, or fall back to constructed name
  const envKey = FUNCTION_ARN_MAP[functionName as string];
  const functionIdentifier = envKey && process.env[envKey]
    ? process.env[envKey]
    : `${serviceName}-dev-${functionName}`;

  // Wrap input in the expected Lambda event format (simulating API Gateway)
  const lambdaEvent = {
    body: JSON.stringify(input),
  };

  const command = new InvokeCommand({
    FunctionName: functionIdentifier,
    InvocationType: 'RequestResponse',
    Payload: new TextEncoder().encode(JSON.stringify(lambdaEvent)),
  });
  const response = await client.send(command);

  const payloadString = new TextDecoder('utf-8').decode(response.Payload);
  const parsedResponse = JSON.parse(payloadString);

  // If the Lambda returned an error, throw it
  if (response.FunctionError) {
    const errorMessage = parsedResponse.errorMessage || parsedResponse.message || 'Unknown Lambda error';
    throw new Error(errorMessage);
  }

  return parsedResponse;
};
