import { Snowflake } from 'discord.js';
import {
  DatabaseManager,
  makeGuildMemberRepository,
  IGuildMember,
} from '@togethercrew.dev/db';
import parentLogger from '../../config/logger.config';
const logger = parentLogger.child({ activity: 'discord:member' });

export async function createMember(
  guildId: Snowflake,
  data: IGuildMember,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeGuildMemberRepository(dbConnection);

  try {
    await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn(
        { guildId, discordId: data.discordId },
        'Member already exists',
      );
    } else {
      throw err;
    }
  }
}

export async function updateMember(
  guildId: Snowflake,
  data: IGuildMember,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeGuildMemberRepository(dbConnection);

  const res = await repo.updateOne({ discordId: data.discordId }, data);
  if (!res.modifiedCount) await repo.create(data);
}

export async function softDeleteMember(
  guildId: Snowflake,
  data: IGuildMember,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeGuildMemberRepository(dbConnection);
  await repo.updateOne(
    { discordId: data.discordId },
    { deletedAt: new Date() },
  );
}
