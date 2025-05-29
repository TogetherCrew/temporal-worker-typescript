// import { Message, Role, TextChannel, User } from 'discord.js';
// import { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';

// import { IRawInfo } from '@togethercrew.dev/db';

// export interface ThreadInfo {
//   threadId: string | null;
//   threadName: string | null;
//   channelId: string;
//   channelName: string | null;
// }

// export function toIRawInfo(message: GatewayMessageCreateDispatchData): IRawInfo {
//   return {
//     type: message.type,
//     author: message.author.id,
//     content: message.content,
//     createdDate: new Date(message.timestamp),
//     role_mentions: message.mention_roles,
//     user_mentions: message.mentions,
//     replied_user: message.type === 19 ? message.referenced_message?.id : null,
//     reactions: message.reactions,
//     messageId: message.id,
//     channelId: thread?.channelId ?? message.channelId,
//     channelName:
//       thread?.channelName ??
//       (message.channel instanceof TextChannel ? message.channel.name : null),
//     threadId: thread?.threadId ?? null,
//     threadName: thread?.threadName ?? null,
//     isGeneratedByWebhook: Boolean(message.webhookId),
//   };
// }

import {
  GatewayMessageCreateDispatchData,
  GatewayMessageUpdateDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
  APIMessage,
  APIReaction,
} from 'discord-api-types/v10';
import { IRawInfo, IRawInfoUpdateBody } from '@togethercrew.dev/db';
import { Snowflake } from 'discord.js';

// Helper function to format reaction strings according to the schema
const formatReaction = (userIds: string[], emoji: string): string => {
  return `${userIds.join(',')},${emoji}`;
};

// Helper function to find existing reaction by emoji
const findReactionByEmoji = (
  reactions: string[],
  emoji: string,
): string | undefined => {
  return reactions.find((reaction) => {
    const parts = reaction.split(',');
    return parts[parts.length - 1] === emoji;
  });
};

// Helper function to get user IDs from a reaction string
const getUserIdsFromReaction = (reaction: string): string[] => {
  const parts = reaction.split(',');
  return parts.slice(0, -1); // All parts except the last one (emoji)
};

// Helper function to get emoji from a reaction string
const getEmojiFromReaction = (reaction: string): string => {
  const parts = reaction.split(',');
  return parts[parts.length - 1]; // Last part is emoji
};

// Helper function to create a full IRawInfo from partial update and original
function createUpdatedRawInfo(
  original: IRawInfo,
  update: Partial<IRawInfo>,
): IRawInfo {
  return {
    ...original,
    ...update,
  };
}

// Map message create event
export function mapMessageCreate(
  payload: GatewayMessageCreateDispatchData,
): IRawInfo {
  return {
    type: payload.type,
    author: payload.author.id,
    content: payload.content || '',
    createdDate: new Date(payload.timestamp),
    user_mentions: payload.mentions?.map((user) => user.id) || [],
    role_mentions: payload.mention_roles || [],
    reactions: [], // New messages don't have reactions yet
    replied_user: payload.referenced_message?.author?.id || null,
    messageId: payload.id,
    channelId: payload.channel_id,
    channelName: null, // This would need to be populated from channel data
    threadId: null, // This would need to be determined from channel type
    threadName: null,
    isGeneratedByWebhook: Boolean(payload.webhook_id),
  };
}

// Map message update event
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

// Map reaction add
export function mapReactionAdd(
  payload: GatewayMessageReactionAddDispatchData,
  existingRawInfo?: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';

  if (existingRawInfo) {
    const existingReactions = existingRawInfo.reactions || [];
    const existingReaction = findReactionByEmoji(existingReactions, emojiStr);

    if (existingReaction) {
      // Emoji already exists, add user to existing reaction
      const userIds = getUserIdsFromReaction(existingReaction);
      if (!userIds.includes(payload.user_id)) {
        userIds.push(payload.user_id);
        const updatedReaction = formatReaction(userIds, emojiStr);

        // Replace the old reaction with the updated one
        const updatedReactions = existingReactions.map((reaction) =>
          reaction === existingReaction ? updatedReaction : reaction,
        );

        return createUpdatedRawInfo(existingRawInfo, {
          reactions: updatedReactions,
        });
      }
      // User already reacted with this emoji, no change needed
      return existingRawInfo;
    } else {
      // New emoji, create new reaction element
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

// Map reaction remove
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
      // Remove the entire reaction element if no users left
      const updatedReactions = existingReactions.filter(
        (reaction) => reaction !== existingReaction,
      );
      return createUpdatedRawInfo(existingRawInfo, {
        reactions: updatedReactions,
      });
    } else {
      // Update the reaction with remaining users
      const updatedReaction = formatReaction(updatedUserIds, emojiStr);
      const updatedReactions = existingReactions.map((reaction) =>
        reaction === existingReaction ? updatedReaction : reaction,
      );
      return createUpdatedRawInfo(existingRawInfo, {
        reactions: updatedReactions,
      });
    }
  }

  // Reaction not found, return unchanged
  return existingRawInfo;
}

// Map reaction remove all
export function mapReactionRemoveAll(
  payload: GatewayMessageReactionRemoveAllDispatchData,
  existingRawInfo: IRawInfo,
): IRawInfo {
  // Clear all reactions
  return createUpdatedRawInfo(existingRawInfo, { reactions: [] });
}

// Map reaction remove emoji
export function mapReactionRemoveEmoji(
  payload: GatewayMessageReactionRemoveEmojiDispatchData,
  existingRawInfo: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';

  // Remove all reactions with this emoji
  const updatedReactions = (existingRawInfo.reactions || []).filter(
    (reaction) => {
      return getEmojiFromReaction(reaction) !== emojiStr;
    },
  );

  return createUpdatedRawInfo(existingRawInfo, { reactions: updatedReactions });
}

// Delete operations don't need mappers, as we just use the message ID

export const MessageMappers = {
  create: mapMessageCreate,
  update: mapMessageUpdate,
  reactionAdd: mapReactionAdd,
  reactionRemove: mapReactionRemove,
  reactionRemoveAll: mapReactionRemoveAll,
  reactionRemoveEmoji: mapReactionRemoveEmoji,
};
