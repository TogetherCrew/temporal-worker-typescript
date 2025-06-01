import { GatewayDispatchPayload } from 'discord-api-types/v10';

import { eventHandlers } from './handlers';

export async function DiscordGatewayEventWorkflow(
  payload: GatewayDispatchPayload,
): Promise<void> {
  const { t: event, d } = payload;
  if (!(event in eventHandlers)) {
    throw new Error(`Unsupported gateway event: ${event as string}`);
  }
  await (eventHandlers as any)[event](d);
}
