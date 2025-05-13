import { Snowflake } from 'discord.js';

import { DatabaseManager, IRawInfo, makeRawInfoRepository } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ activity: 'discord:channel' });

export async function createRawInfo(
  guildId: Snowflake,
  data: IRawInfo,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRawInfoRepository(dbConnection);

  try {
    await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn(
        { guildId, messageId: data.messageId },
        'RawInfo already exists',
      );
    } else {
      throw err;
    }
  }
}

export async function updateRawInfo(
  guildId: Snowflake,
  data: IRawInfo,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRawInfoRepository(dbConnection);

  const res = await repo.updateOne({ messageId: data.messageId }, data);
  if (!res.modifiedCount) await repo.create(data);
}

export async function deleteRawInfo(
  guildId: Snowflake,
  data: IRawInfo,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRawInfoRepository(dbConnection);
  await repo.deleteOne({ messageId: data.messageId });
}

export async function deleteRawInfos(
  guildId: Snowflake,
  data: IRawInfo,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRawInfoRepository(dbConnection);
  await repo.deleteMany({ messageId: data.messageId });
}
