// src/domain/transformers/message.transformer.ts
import { Message, Role, TextChannel, User } from 'discord.js';

import { IRawInfo } from '@togethercrew.dev/db';

export interface ThreadInfo {
  threadId: string | null;
  threadName: string | null;
  channelId: string;
  channelName: string | null;
}

export function toIRawInfo(
  msg: Message,
  reactions: string[],
  thread?: ThreadInfo,
): IRawInfo {
  return {
    type: msg.type,
    author: msg.author.id,
    content: msg.content,
    createdDate: msg.createdAt,
    role_mentions: msg.mentions.roles.map((r: Role) => r.id),
    user_mentions: msg.mentions.users.map((u: User) => u.id),
    replied_user: msg.type === 19 ? msg.mentions.repliedUser?.id : null,
    reactions,
    messageId: msg.id,
    channelId: thread?.channelId ?? msg.channelId,
    channelName:
      thread?.channelName ??
      (msg.channel instanceof TextChannel ? msg.channel.name : null),
    threadId: thread?.threadId ?? null,
    threadName: thread?.threadName ?? null,
    isGeneratedByWebhook: Boolean(msg.webhookId),
  };
}
