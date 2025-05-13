import { proxyActivities } from '@temporalio/workflow';
import type * as Activities from '../../activities';
import { EventIngestInput } from '../../shared/types/discord/discordEvents';

const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});

function assertNever(x: never): never {
  throw new Error(`Unhandled event type: ${x as string}`);
}

export async function eventIngest({
  type,
  guildId,
  payload,
}: EventIngestInput): Promise<void> {
  switch (type) {
    case 'channelCreate':
      return activitiesProxy.createChannel(guildId, payload);
    case 'channelUpdate':
      return activitiesProxy.updateChannel(guildId, payload);
    case 'channelDelete':
      return activitiesProxy.softDeleteChannel(guildId, payload);

    default:
      return;
  }
}
