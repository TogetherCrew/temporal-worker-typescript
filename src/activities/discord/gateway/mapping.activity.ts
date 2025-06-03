import {
  GatewayChannelCreateDispatchData,
  GatewayChannelDeleteDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GatewayGuildMemberUpdateDispatchData,
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
  GatewayGuildRoleUpdateDispatchData,
  GatewayMessageCreateDispatchData,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
  GatewayMessageUpdateDispatchData,
} from 'discord-api-types/v10';

import { IRawInfo } from '@togethercrew.dev/db';

import parentLogger from '../../../config/logger.config';
import {
  ChannelMappers,
  GuildMemberMappers,
  MessageMappers,
  RoleMappers,
} from '../../../workflows/discord/gateway/mappers';

const logger = parentLogger.child({ activity: 'discord:event:map' });

export async function mapChannelCreate(
  payload: GatewayChannelCreateDispatchData,
) {
  return ChannelMappers.add(payload);
}

export async function mapChannelUpdate(
  payload: GatewayChannelUpdateDispatchData,
) {
  return ChannelMappers.update(payload);
}

export async function mapChannelDelete(
  payload: GatewayChannelDeleteDispatchData,
) {
  return ChannelMappers.remove(payload);
}

export async function mapGuildMemberCreate(
  payload: GatewayGuildMemberAddDispatchData,
) {
  return GuildMemberMappers.add(payload);
}

export async function mapGuildMemberUpdate(
  payload: GatewayGuildMemberUpdateDispatchData,
) {
  return GuildMemberMappers.update(payload);
}

export async function mapGuildMemberDelete(
  payload: GatewayGuildMemberRemoveDispatchData,
) {
  return GuildMemberMappers.remove(payload);
}

export async function mapRoleCreate(
  payload: GatewayGuildRoleCreateDispatchData,
) {
  return RoleMappers.add(payload);
}

export async function mapRoleUpdate(
  payload: GatewayGuildRoleUpdateDispatchData,
) {
  return RoleMappers.update(payload);
}

export async function mapRoleDelete(
  payload: GatewayGuildRoleDeleteDispatchData,
) {
  return RoleMappers.remove(payload);
}

// Message mapping activities
export async function mapMessageCreate(
  payload: GatewayMessageCreateDispatchData,
) {
  logger.debug({ messageId: payload.id }, 'Mapping message create event');
  return MessageMappers.create(payload);
}

export async function mapMessageUpdate(
  payload: GatewayMessageUpdateDispatchData,
) {
  logger.debug({ messageId: payload.id }, 'Mapping message update event');
  return MessageMappers.update(payload);
}

export async function mapMessageDelete(
  payload: GatewayMessageDeleteDispatchData,
) {
  logger.debug({ messageId: payload.id }, 'Mapping message delete event');
  // Return the message ID for deletion - no mapping needed
  return payload.id;
}

export async function mapMessageDeleteBulk(
  payload: GatewayMessageDeleteBulkDispatchData,
) {
  logger.debug(
    { messageIds: payload.ids },
    'Mapping bulk message delete event',
  );
  // Return the message IDs for bulk deletion - no mapping needed
  return payload.ids;
}

export async function mapMessageReactionAdd(
  payload: GatewayMessageReactionAddDispatchData,
  existingRawInfo?: IRawInfo,
) {
  logger.debug(
    {
      messageId: payload.message_id,
      emoji: payload.emoji.name || payload.emoji.id,
      userId: payload.user_id,
    },
    'Mapping reaction add event',
  );
  return MessageMappers.reactionAdd(payload, existingRawInfo);
}

export async function mapMessageReactionRemove(
  payload: GatewayMessageReactionRemoveDispatchData,
  existingRawInfo: IRawInfo,
) {
  logger.debug(
    {
      messageId: payload.message_id,
      emoji: payload.emoji.name || payload.emoji.id,
      userId: payload.user_id,
    },
    'Mapping reaction remove event',
  );
  return MessageMappers.reactionRemove(payload, existingRawInfo);
}

export async function mapMessageReactionRemoveAll(
  payload: GatewayMessageReactionRemoveAllDispatchData,
  existingRawInfo: IRawInfo,
) {
  logger.debug(
    { messageId: payload.message_id },
    'Mapping reaction remove all event',
  );
  return MessageMappers.reactionRemoveAll(payload, existingRawInfo);
}

export async function mapMessageReactionRemoveEmoji(
  payload: GatewayMessageReactionRemoveEmojiDispatchData,
  existingRawInfo: IRawInfo,
) {
  logger.debug(
    {
      messageId: payload.message_id,
      emoji: payload.emoji.name || payload.emoji.id,
    },
    'Mapping reaction remove emoji event',
  );
  return MessageMappers.reactionRemoveEmoji(payload, existingRawInfo);
}
