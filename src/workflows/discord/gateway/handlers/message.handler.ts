import {
  GatewayMessageCreateDispatchData,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
  GatewayMessageUpdateDispatchData,
} from 'discord-api-types/v10';

import { proxyActivities } from '@temporalio/workflow';

import type * as Activities from '../../../../activities';
import {
  DatabaseManager,
  makeChannelRepository,
  makeRawInfoRepository,
  makeThreadRepository,
} from '@togethercrew.dev/db';

const activities = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});
async function guardMessage(
  guildId: string,
  channelId: string,
  authorId?: string,
): Promise<boolean> {
  // if (!(await activities.isChannelSelected(guildId, channelId))) return false;
  if (authorId && (await activities.isUserIgnored(guildId, authorId)))
    return false;
  return true;
}

export class MessageHandler {
  static async create(data: GatewayMessageCreateDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id, data.author.id)))
      return;
    const mapped = await activities.mapMessageCreate(data);
    // TODO: Need to remove this section
    const tempData: any = data;
    const isThreadMessage =
      tempData.channel_type === 10 ||
      tempData.channel_type === 11 ||
      tempData.channel_type === 12;
    if (isThreadMessage) {
      const channelId = await activities.getChannelIdFromThread(data);
      mapped.channelId = channelId;
    }
    // TODO: Until Here
    await activities.createRawInfo(data.guild_id, mapped);
  }

  static async update(data: GatewayMessageUpdateDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id, data.author?.id)))
      return;

    const mapped = await activities.mapMessageUpdate(data);

    await activities.updateRawInfo(
      data.guild_id,
      { messageId: data.id },
      mapped,
    );
  }

  static async delete(data: GatewayMessageDeleteDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id))) return;
    await activities.deleteRawInfo(data.guild_id, data.id);
  }

  static async deleteBulk(data: GatewayMessageDeleteBulkDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id))) return;
    await activities.deleteRawInfos(data.guild_id, data.ids);
  }
  static async reactionAdd(data: GatewayMessageReactionAddDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id, data.user_id)))
      return;

    const current = await activities.getRawInfo(data.guild_id, data.message_id);
    const mapped = await activities.mapMessageReactionAdd(
      data,
      current ?? undefined,
    );
    await activities.updateRawInfo(
      data.guild_id,
      { messageId: data.message_id },
      mapped,
    );
  }

  static async reactionRemove(data: GatewayMessageReactionRemoveDispatchData) {
    if (!(await guardMessage(data.guild_id, data.channel_id, data.user_id)))
      return;

    const current = await activities.getRawInfo(data.guild_id, data.message_id);
    const mapped = await activities.mapMessageReactionRemove(data, current);
    await activities.updateRawInfo(
      data.guild_id,
      { messageId: data.message_id },
      mapped,
    );
  }

  static async reactionRemoveAll(
    data: GatewayMessageReactionRemoveAllDispatchData,
  ) {
    if (!(await guardMessage(data.guild_id, data.channel_id))) return;

    const current = await activities.getRawInfo(data.guild_id, data.message_id);
    const mapped = await activities.mapMessageReactionRemoveAll(data, current);
    await activities.updateRawInfo(
      data.guild_id,
      { messageId: data.message_id },
      mapped,
    );
  }

  static async reactionRemoveEmoji(
    data: GatewayMessageReactionRemoveEmojiDispatchData,
  ) {
    if (!(await guardMessage(data.guild_id, data.channel_id))) return;

    const current = await activities.getRawInfo(data.guild_id, data.message_id);
    const mapped = await activities.mapMessageReactionRemoveEmoji(
      data,
      current,
    );
    await activities.updateRawInfo(
      data.guild_id,
      { messageId: data.message_id },
      mapped,
    );
  }
}
