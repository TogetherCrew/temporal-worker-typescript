import { Snowflake } from 'discord.js';
import {
  GuildMemberMappers,
  ChannelMappers,
  RoleMappers,
  MessageMappers,
} from '../../../domain/mapers/discord';
import {
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberUpdateDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GatewayChannelCreateDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayChannelDeleteDispatchData,
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleUpdateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
  GatewayMessageCreateDispatchData,
  GatewayMessageUpdateDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
} from 'discord-api-types/v10';

import parentLogger from '../../../config/logger.config';
import { IRawInfo } from '@togethercrew.dev/db';

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

export async function mapGuildMemberAdd(
  payload: GatewayGuildMemberAddDispatchData,
) {
  return GuildMemberMappers.add(payload);
}

export async function mapGuildMemberUpdate(
  payload: GatewayGuildMemberUpdateDispatchData,
) {
  return GuildMemberMappers.update(payload);
}

export async function mapGuildMemberRemove(
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

export async function mapMessageReactionAdd(
  payload: GatewayMessageReactionAddDispatchData,
  existingRawInfo?: IRawInfo,
) {
  logger.debug(
    {
      messageId: payload.message_id,
      emoji: payload.emoji.name || payload.emoji.id,
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
