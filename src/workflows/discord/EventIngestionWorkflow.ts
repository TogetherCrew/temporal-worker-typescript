import { proxyActivities } from '@temporalio/workflow';

import { DiscordEventType } from '../../shared/types/discord/discordEvents';
import { EventIngestInput } from '../../shared/types/discord/EventIngestion.discord';

import type * as Activities from '../../activities';
const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});
export async function eventIngest({
  type,
  guildId,
  payload,
}: EventIngestInput & { type: DiscordEventType }): Promise<void> {
  switch (type) {
    case 'channelCreate':
      return activitiesProxy.createChannel(guildId, payload as any);

    case 'channelUpdate':
      return activitiesProxy.updateChannel(guildId, payload as any);
    case 'channelDelete':
      return activitiesProxy.softDeleteChannel(guildId, payload as any);

    case 'guildMemberAdd':
      return activitiesProxy.createMember(guildId, payload as any);

    case 'guildMemberUpdate':
      return activitiesProxy.updateMember(guildId, payload as any);

    case 'userUpdate':
      return activitiesProxy.updateMember(guildId, payload as any);

    case 'guildMemberRemove':
      return activitiesProxy.softDeleteMember(guildId, payload as any);

    case 'roleCreate':
      return activitiesProxy.createRole(guildId, payload as any);

    case 'roleUpdate':
      return activitiesProxy.updateRole(guildId, payload as any);

    case 'roleDelete':
      return activitiesProxy.softDeleteRole(guildId, payload as any);

    case 'messageCreate':
      return activitiesProxy.createRawInfo(guildId, payload as any);
    case 'messageUpdate':
      return activitiesProxy.updateRawInfo(guildId, payload as any);
    case 'messageReactionAdd':
      return activitiesProxy.updateRawInfo(guildId, payload as any);

    case 'messageReactionRemove':
      return activitiesProxy.updateRawInfo(guildId, payload as any);

    case 'messageReactionRemoveAll':
      return activitiesProxy.updateRawInfo(guildId, payload as any);

    case 'messageReactionRemoveEmoji':
      return activitiesProxy.updateRawInfo(guildId, payload as any);
    case 'messageDelete':
      return activitiesProxy.deleteRawInfo(guildId, payload as any);
    case 'messageDeleteBulk':
      return activitiesProxy.deleteRawInfos(guildId, payload as any);

    default:
      throw new Error(`Unhandled event type: ${type}`);
  }
}
