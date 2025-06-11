import { GatewayDispatchPayload } from 'discord-api-types/v10';

import { log } from '@temporalio/workflow';

import { eventHandlers } from './handlers';

export async function DiscordGatewayEventWorkflow(
  payload: GatewayDispatchPayload,
): Promise<void> {
  const { t: event, d } = payload;
  if (!(event in eventHandlers)) {
    log.warn('Unsupported gateway event');
    return;
  }
  await (eventHandlers as any)[event](d);
}
