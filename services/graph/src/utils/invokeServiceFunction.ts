import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

interface ServiceFunction<TInput, TOutput> {
  serviceName: string;
  functionName: string;
  input: TInput;
  output: TOutput;
}

export const invokeServiceFunction = async <
  T extends ServiceFunction<unknown, unknown>,
>(
  serviceName: T['serviceName'],
  functionName: T['functionName'],
  input: T['input'],
): Promise<T['output']> => {
  const client = new LambdaClient({ region: 'us-east-1' });
  const command = new InvokeCommand({
    FunctionName: `${serviceName}-dev-${functionName}`,
    InvocationType: 'RequestResponse',
    Payload: new TextEncoder().encode(JSON.stringify(input)),
  });
  const response = await client.send(command);
  const parsedResponse = JSON.parse(
    new TextDecoder('utf-8').decode(response.Payload),
  );
  return parsedResponse;
};
