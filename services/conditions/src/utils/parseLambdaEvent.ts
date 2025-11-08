/**
 * Parses Lambda event input handling both direct invocation and API Gateway formats
 *
 * @param event - The Lambda event object
 * @param requiredField - The field name that must exist in the parsed input
 * @returns Parsed input of type T
 * @throws Error if the required field is not found in any format
 */
export function parseLambdaEvent<T>(event: any, requiredField: keyof T): T {
  let input: T;

  // Case 1: API Gateway event with JSON string body
  if (event.body && typeof event.body === 'string') {
    input = JSON.parse(event.body);
  }
  // Case 2: API Gateway event with object body (pre-parsed)
  else if (event.body && typeof event.body === 'object') {
    input = event.body;
  }
  // Case 3: Direct invocation with input at top level
  else if (event[requiredField as string] !== undefined) {
    input = event;
  }
  // Case 4: Invalid format
  else {
    throw new Error(`Invalid event format - no ${String(requiredField)} found`);
  }

  return input;
}
