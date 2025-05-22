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

// Helper function to format reaction strings
const formatReaction = (
  userId: string,
  emoji: string,
  guildId?: string,
): string => {
  if (guildId) {
    return `${userId},${guildId},${emoji}`;
  }
  return `${userId},${emoji}`;
};

// Format reactions array if present in message
const formatReactionsIfPresent = (message: APIMessage): string[] => {
  // New messages don't have reactions, so default to empty array
  if (!message.reactions || message.reactions.length === 0) {
    return [];
  }

  // For existing messages with reactions, format them according to our schema
  // Note: In Gateway events, reactions in message objects don't include user_id
  // They only have count and "me" flag (if current user reacted)
  return [];
};

// Basic message mapping function
const mapMessage = (message: GatewayMessageCreateDispatchData): IRawInfo => {
  return {
    type: message.type,
    author: message.author.id,
    content: message.content,
    createdDate: new Date(message.timestamp),
    user_mentions: message.mentions.map((user) => user.id),
    role_mentions: message.mention_roles,
    // For newly created messages, there are no reactions yet
    reactions: [],
    replied_user: message.referenced_message?.author.id || null,
    messageId: message.id,
    channelId: message.channel_id,
    channelName: null, // Would need to be filled elsewhere
    threadId: message.thread?.id || null,
    threadName: message.thread?.name || null,
    isGeneratedByWebhook: message.webhook_id ? true : false,
  };
};

// Map message create event
export function mapMessageCreate(
  payload: GatewayMessageCreateDispatchData,
): IRawInfo {
  return mapMessage(payload);
}

// Map message update event
export function mapMessageUpdate(
  payload: GatewayMessageUpdateDispatchData,
): IRawInfoUpdateBody {
  return {
    content: payload.content,
    // Only include these if they are present in the update payload
    ...(payload.channel_id && { channelId: payload.channel_id }),
    ...(payload.thread && {
      threadId: payload.thread.id,
      threadName: payload.thread.name,
    }),
  };
}

// Helper function to create a full IRawInfo from partial update and original
function createUpdatedRawInfo(
  original: IRawInfo,
  update: { reactions: string[] },
): IRawInfo {
  return {
    ...original,
    reactions: update.reactions,
  };
}

// Map reaction add
export function mapReactionAdd(
  payload: GatewayMessageReactionAddDispatchData,
  existingRawInfo?: IRawInfo,
): IRawInfo {
  const emojiStr = payload.emoji.id || payload.emoji.name || 'unknown_emoji';
  const reactionStr = formatReaction(
    payload.user_id,
    emojiStr,
    payload.guild_id,
  );

  // If we have existing raw info, append to its reactions
  if (existingRawInfo) {
    const updatedReactions = [...existingRawInfo.reactions, reactionStr];
    return createUpdatedRawInfo(existingRawInfo, {
      reactions: updatedReactions,
    });
  }

  // Create a minimal IRawInfo if none exists (should not happen normally)
  return {
    type: 0, // Default message type
    author: payload.user_id, // Best guess at author
    content: '',
    createdDate: new Date(),
    user_mentions: [],
    role_mentions: [],
    reactions: [reactionStr],
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
  const reactionToRemove = formatReaction(
    payload.user_id,
    emojiStr,
    payload.guild_id,
  );

  // Filter out the removed reaction
  const updatedReactions = existingRawInfo.reactions.filter(
    (reaction) => reaction !== reactionToRemove,
  );

  return createUpdatedRawInfo(existingRawInfo, { reactions: updatedReactions });
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

  // Filter out all reactions with this emoji
  const updatedReactions = existingRawInfo.reactions.filter((reaction) => {
    const parts = reaction.split(',');
    // Check if the last part is the emoji we're removing
    return parts[parts.length - 1] !== emojiStr;
  });

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
