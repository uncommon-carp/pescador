import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

const eventBridgeClient = new EventBridgeClient({ region: 'us-east-1' });

export const publishEvent = async (
  source: string,
  detailType: string,
  detail: object,
): Promise<void> => {
  const putEventsCommand = new PutEventsCommand({
    Entries: [
      {
        EventBusName: 'default',
        Source: source,
        DetailType: detailType,
        Detail: JSON.stringify(detail),
      },
    ],
  });

  try {
    await eventBridgeClient.send(putEventsCommand);
  } catch (error) {
    console.error('Failed to publish event to default EventBridge:', error);
    throw error;
  }
};
