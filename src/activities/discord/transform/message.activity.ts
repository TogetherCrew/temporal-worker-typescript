// src/activities/transform.activities.ts
import { Message, Snowflake, TextChannel } from 'discord.js';
import fetch from 'node-fetch';

import { IRawInfo } from '@togethercrew.dev/db';

import { ThreadInfo, toIRawInfo } from '../../../domain/transformers/discord/message';

/* ─── Discord REST helpers ───────────────────────────────────── */

async function fetchAllUsersForReaction(
  channelId: Snowflake,
  messageId: Snowflake,
  encodedEmoji: string,
): Promise<string[]> {
  const limit = 100;
  let after = '';
  const users: string[] = [];

  for (;;) {
    const url =
      `https://discord.com/api/v10/channels/${channelId}` +
      `/messages/${messageId}/reactions/${encodedEmoji}` +
      `?limit=${limit}${after ? `&after=${after}` : ''}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bot ${config.discord.botToken}` },
    });

    if (res.ok) {
      const batch = (await res.json()) as { id: string }[];
      users.push(...batch.map((u) => u.id));
      if (batch.length < limit) break;
      after = batch[batch.length - 1].id;
    } else if (res.status === 429) {
      const wait = (await res.json()).retry_after * 1000;
      await new Promise((r) => setTimeout(r, wait));
    } else {
      throw new Error(`Discord HTTP ${res.status}: ${await res.text()}`);
    }
  }

  return users;
}

async function getReactions(msg: Message): Promise<string[]> {
  const arr: string[] = [];
  for (const r of msg.reactions.cache.values()) {
    const emojiKey = r.emoji.id
      ? `${r.emoji.name}:${r.emoji.id}`
      : r.emoji.name!;
    const ids = await fetchAllUsersForReaction(
      msg.channel.id,
      msg.id,
      encodeURIComponent(emojiKey),
    );
    arr.push(`${ids.join(',')},${r.emoji.name}`);
  }
  return arr;
}

/* ─── Activity entry ─────────────────────────────────────────── */

export async function transformMessage(
  guildId: Snowflake,
  msg: Message,
): Promise<IRawInfo> {
  const thread: ThreadInfo | undefined = msg.channel.isThread()
    ? {
        threadId: msg.channel.id,
        threadName: msg.channel.name,
        channelId: msg.channel.id,
        channelName:
          (msg.channel.parent as TextChannel | undefined)?.name ?? null,
      }
    : undefined;

  const reactions = await getReactions(msg);
  return toIRawInfo(msg, reactions, thread);
}

/* export bag for proxyActivities */
export const transformActivities = { transformMessage };
