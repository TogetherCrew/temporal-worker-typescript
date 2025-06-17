import {
    GatewayMessageReactionAddDispatchData, GatewayMessageReactionRemoveAllDispatchData,
    GatewayMessageReactionRemoveDispatchData, GatewayMessageReactionRemoveEmojiDispatchData,
    GatewayMessageUpdateDispatchData
} from 'discord-api-types/v10';

import { IRawInfo, IRawInfoUpdateBody } from '@togethercrew.dev/db';

const formatReaction = (userIds: string[], emoji: string): string => {
  return `${userIds.join(',')},${emoji}`;
};

const findReactionByEmoji = (
  reactions: string[],
  emoji: string,
): string | undefined => {
  return reactions.find((reaction) => {
    const parts = reaction.split(',');
    return parts[parts.length - 1] === emoji;
  });
};

const getUserIdsFromReaction = (reaction: string): string[] => {
  const parts = reaction.split(',');
  return parts.slice(0, -1);
};

const getEmojiFromReaction = (reaction: string): string => {
  const parts = reaction.split(',');
  return parts[parts.length - 1];
};

function createUpdatedRawInfo(
  original: IRawInfo,
  update: Partial<IRawInfo>,
): IRawInfo {
  return {
    ...original,
    ...update,
  };
}

export function mapMessageCreate(
  // payload: GatewayMessageCreateDispatchData,
  payload: any,
): IRawInfo {
  const isThreadMessage =
    payload.channel_type === 10 ||
    payload.channel_type === 11 ||
    payload.channel_type === 12;

  return {
    type: payload.type,
    author: payload.author.id,
    content: payload.content || '',
    createdDate: new Date(payload.timestamp),
    user_mentions: payload.mentions?.map((user) => user.id) || [],
    role_mentions: payload.mention_roles || [],
    reactions: [],
    replied_user: payload.referenced_message?.author?.id || null,
    messageId: payload.id,
    channelId: isThreadMessage ? null : payload.channel_id,
    channelName: null,
    threadId: isThreadMessage ? payload.channel_id : null,
    threadName: null,
    isGeneratedByWebhook: Boolean(payload.webhook_id),
  };
}

export function mapMessageUpdate(
  payload: GatewayMessageUpdateDispatchData,
): IRawInfoUpdateBody {
  const updateData: any = {};

  if (payload.content !== undefined) {
    updateData.content = payload.content;
  }

  if (payload.mentions) {
    updateData.user_mentions = payload.mentions.map((user) => user.id);
  }

  if (payload.mention_roles) {
    updateData.role_mentions = payload.mention_roles;
  }

  return updateData;
}

export function mapReactionAdd(
  payload: GatewayMessageReactionAddDispatchData,
  existingRawInfo?: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';

  if (existingRawInfo) {
    const existingReactions = existingRawInfo.reactions || [];
    const existingReaction = findReactionByEmoji(existingReactions, emojiStr);

    if (existingReaction) {
      const userIds = getUserIdsFromReaction(existingReaction);
      if (!userIds.includes(payload.user_id)) {
        userIds.push(payload.user_id);
        const updatedReaction = formatReaction(userIds, emojiStr);

        const updatedReactions = existingReactions.map((reaction) =>
          reaction === existingReaction ? updatedReaction : reaction,
        );

        return createUpdatedRawInfo(existingRawInfo, {
          reactions: updatedReactions,
        });
      }
      return existingRawInfo;
    } else {
      const newReaction = formatReaction([payload.user_id], emojiStr);
      const updatedReactions = [...existingReactions, newReaction];

      return createUpdatedRawInfo(existingRawInfo, {
        reactions: updatedReactions,
      });
    }
  }

  // Create a minimal IRawInfo if none exists (fallback case)
  const newReaction = formatReaction([payload.user_id], emojiStr);
  return {
    type: 0,
    author: payload.message_author_id || payload.user_id,
    content: '',
    createdDate: new Date(),
    user_mentions: [],
    role_mentions: [],
    reactions: [newReaction],
    replied_user: null,
    messageId: payload.message_id,
    channelId: payload.channel_id,
    channelName: null,
    threadId: null,
    threadName: null,
    isGeneratedByWebhook: false,
  };
}

export function mapReactionRemove(
  payload: GatewayMessageReactionRemoveDispatchData,
  existingRawInfo: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';
  const existingReactions = existingRawInfo.reactions || [];
  const existingReaction = findReactionByEmoji(existingReactions, emojiStr);

  if (existingReaction) {
    const userIds = getUserIdsFromReaction(existingReaction);
    const updatedUserIds = userIds.filter(
      (userId) => userId !== payload.user_id,
    );

    if (updatedUserIds.length === 0) {
      const updatedReactions = existingReactions.filter(
        (reaction) => reaction !== existingReaction,
      );
      return createUpdatedRawInfo(existingRawInfo, {
        reactions: updatedReactions,
      });
    } else {
      const updatedReaction = formatReaction(updatedUserIds, emojiStr);
      const updatedReactions = existingReactions.map((reaction) =>
        reaction === existingReaction ? updatedReaction : reaction,
      );
      return createUpdatedRawInfo(existingRawInfo, {
        reactions: updatedReactions,
      });
    }
  }

  return existingRawInfo;
}

export function mapReactionRemoveAll(
  payload: GatewayMessageReactionRemoveAllDispatchData,
  existingRawInfo: IRawInfo,
): IRawInfo {
  return createUpdatedRawInfo(existingRawInfo, { reactions: [] });
}

export function mapReactionRemoveEmoji(
  payload: GatewayMessageReactionRemoveEmojiDispatchData,
  existingRawInfo: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';

  const updatedReactions = (existingRawInfo.reactions || []).filter(
    (reaction) => {
      return getEmojiFromReaction(reaction) !== emojiStr;
    },
  );

  return createUpdatedRawInfo(existingRawInfo, { reactions: updatedReactions });
}

export const MessageMappers = {
  create: mapMessageCreate,
  update: mapMessageUpdate,
  reactionAdd: mapReactionAdd,
  reactionRemove: mapReactionRemove,
  reactionRemoveAll: mapReactionRemoveAll,
  reactionRemoveEmoji: mapReactionRemoveEmoji,
};
