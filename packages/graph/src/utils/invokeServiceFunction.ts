import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export async function invokeServiceFunction(
  name: string,
  input: Record<string, unknown>,
) {
  const client = new LambdaClient({ region: "us-east-1" });
  const command = new InvokeCommand({
    FunctionName: name,
    InvocationType: "RequestResponse",
    Payload: new TextEncoder().encode(JSON.stringify(input)),
  });
  const response = await client.send(command);
  const parsedResponse = JSON.parse(
    new TextDecoder("utf-8").decode(response.Payload),
  );
  return parsedResponse;
}
