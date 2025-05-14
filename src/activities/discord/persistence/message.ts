// src/activities/persistence.activities.ts
import { Snowflake } from 'discord.js';

import { DatabaseManager, IRawInfo, makeRawInfoRepository } from '@togethercrew.dev/db';

export async function createRawInfo(guildId: Snowflake, doc: IRawInfo) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).create(doc);
}

export async function updateRawInfo(guildId: Snowflake, doc: IRawInfo) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).updateOne({ messageId: doc.messageId }, doc);
}

export async function deleteRawInfo(guildId: Snowflake, messageId: Snowflake) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).deleteOne({ messageId });
}

export async function deleteRawInfos(guildId: Snowflake, ids: Snowflake[]) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).deleteMany({ messageId: { $in: ids } });
}

/* ─── reaction helpers via repo ─────────────────────────────── */

export async function addReaction(
  guildId: Snowflake,
  messageId: Snowflake,
  userId: Snowflake,
  emoji: string,
) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).upsertReaction(messageId, userId, emoji);
}

export async function removeReaction(
  guildId: Snowflake,
  messageId: Snowflake,
  userId: Snowflake,
  emoji: string,
) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).removeReaction(messageId, userId, emoji);
}

export async function clearReactions(guildId: Snowflake, messageId: Snowflake) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).clearReactions(messageId);
}

export async function removeEmoji(
  guildId: Snowflake,
  messageId: Snowflake,
  emoji: string,
) {
  const db = await DatabaseManager.getInstance().getGuildDb(guildId);
  await makeRawInfoRepository(db).removeEmoji(messageId, emoji);
}

export const persistenceActivities = {
  createRawInfo,
  updateRawInfo,
  deleteRawInfo,
  deleteRawInfos,
  addReaction,
  removeReaction,
  clearReactions,
  removeEmoji,
};
