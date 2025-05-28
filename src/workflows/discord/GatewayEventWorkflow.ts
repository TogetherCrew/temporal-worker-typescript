import { proxyActivities } from '@temporalio/workflow';
import {
  GatewayDispatchPayload,
  GatewayDispatchEvents,
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberUpdateDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GatewayChannelCreateDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayChannelDeleteDispatchData,
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleUpdateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
} from 'discord-api-types/v10';
import { DiscordEventType } from '../../shared/types/discord/discordEvents';
import { GatewayEventInput } from '../../shared/types/discord/EventIngestion.discord';

import type * as Activities from '../../activities';
const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});
export async function gatewayEventWorkflow(
  payload: GatewayDispatchPayload,
): Promise<void> {
  switch (payload.t) {
    case GatewayDispatchEvents.ChannelCreate: {
      const mappedData = await activitiesProxy.mapChannelCreate(payload.d);
      return activitiesProxy.createChannel(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.ChannelUpdate: {
      const mappedData = await activitiesProxy.mapChannelUpdate(payload.d);
      return activitiesProxy.updateChannel(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.ChannelDelete: {
      const mappedData = await activitiesProxy.mapChannelDelete(payload.d);
      return activitiesProxy.softDeleteChannel(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildMemberAdd: {
      const mappedData = await activitiesProxy.mapGuildMemberAdd(payload.d);
      return activitiesProxy.createMember(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildMemberUpdate: {
      const mappedData = await activitiesProxy.mapGuildMemberUpdate(payload.d);
      return activitiesProxy.updateMember(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildMemberRemove: {
      const mappedData = await activitiesProxy.mapGuildMemberRemove(payload.d);
      return activitiesProxy.softDeleteMember(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildRoleCreate: {
      const mappedData = await activitiesProxy.mapRoleCreate(payload.d);
      return activitiesProxy.createRole(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildRoleUpdate: {
      const mappedData = await activitiesProxy.mapRoleUpdate(payload.d);
      return activitiesProxy.updateRole(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.GuildRoleDelete: {
      const mappedData = await activitiesProxy.mapRoleDelete(payload.d);
      return activitiesProxy.softDeleteRole(payload.d.guild_id, mappedData);
    }

    // Message events
    case GatewayDispatchEvents.MessageCreate: {
      const mappedData = await activitiesProxy.mapMessageCreate(payload.d);
      return activitiesProxy.createRawInfo(payload.d.guild_id, mappedData);
    }

    case GatewayDispatchEvents.MessageUpdate: {
      // First get existing message
      const existingRawInfo = await activitiesProxy.getRawInfo(
        payload.d.guild_id,
        payload.d.id,
      );

      if (existingRawInfo) {
        // Update existing message with partial data
        const updateFields = await activitiesProxy.mapMessageUpdate(payload.d);
        return activitiesProxy.updateRawInfo(payload.d.guild_id, payload.d.id, {
          ...existingRawInfo,
          ...updateFields,
        });
      }
      return;
    }

    case GatewayDispatchEvents.MessageDelete: {
      return activitiesProxy.deleteRawInfo(payload.d.guild_id, payload.d.id);
    }

    case GatewayDispatchEvents.MessageDeleteBulk: {
      return activitiesProxy.deleteRawInfos(payload.d.guild_id, payload.d.ids);
    }

    // Reaction events
    case GatewayDispatchEvents.MessageReactionAdd: {
      // First, retrieve the current raw info
      const existingRawInfo = await activitiesProxy.getRawInfo(
        payload.d.guild_id,
        payload.d.message_id,
      );

      // Map the data (with or without existing info)
      const mappedData = await activitiesProxy.mapMessageReactionAdd(
        payload.d,
        existingRawInfo || undefined,
      );

      // Update or create
      return activitiesProxy.updateRawInfo(
        payload.d.guild_id,
        payload.d.message_id,
        mappedData,
      );
    }

    case GatewayDispatchEvents.MessageReactionRemove: {
      // First, retrieve the current raw info
      const existingRawInfo = await activitiesProxy.getRawInfo(
        payload.d.guild_id,
        payload.d.message_id,
      );

      // If the message exists, update its reactions
      if (existingRawInfo) {
        const mappedData = await activitiesProxy.mapMessageReactionRemove(
          payload.d,
          existingRawInfo,
        );
        return activitiesProxy.updateRawInfo(
          payload.d.guild_id,
          payload.d.message_id,
          mappedData,
        );
      }
      return;
    }

    case GatewayDispatchEvents.MessageReactionRemoveAll: {
      // First, retrieve the current raw info
      const existingRawInfo = await activitiesProxy.getRawInfo(
        payload.d.guild_id,
        payload.d.message_id,
      );

      // If the message exists, update its reactions
      if (existingRawInfo) {
        const mappedData = await activitiesProxy.mapMessageReactionRemoveAll(
          payload.d,
          existingRawInfo,
        );
        return activitiesProxy.updateRawInfo(
          payload.d.guild_id,
          payload.d.message_id,
          mappedData,
        );
      }
      return;
    }

    case GatewayDispatchEvents.MessageReactionRemoveEmoji: {
      // First, retrieve the current raw info
      const existingRawInfo = await activitiesProxy.getRawInfo(
        payload.d.guild_id,
        payload.d.message_id,
      );

      // If the message exists, update its reactions
      if (existingRawInfo) {
        const mappedData = await activitiesProxy.mapMessageReactionRemoveEmoji(
          payload.d,
          existingRawInfo,
        );
        return activitiesProxy.updateRawInfo(
          payload.d.guild_id,
          payload.d.message_id,
          mappedData,
        );
      }
      return;
    }

    default:
      throw new Error(`Unhandled event type: ${payload.t}`);
  }
}
