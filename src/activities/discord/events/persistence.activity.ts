import { Snowflake } from 'discord.js';

import {
  DatabaseManager,
  IChannel,
  IGuildMember,
  IRawInfo,
  IRole,
  makeChannelRepository,
  makeGuildMemberRepository,
  makeRawInfoRepository,
  makeRoleRepository,
} from '@togethercrew.dev/db';

import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ activity: 'discord:event:persistence' });

export async function createChannel(
  guildId: Snowflake,
  data: IChannel,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeChannelRepository(dbConnection);

  try {
    await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn(
        { guildId, channelId: data.channelId },
        'Channel already exists',
      );
    } else {
      throw err;
    }
  }
}

export async function updateChannel(
  guildId: Snowflake,
  data: IChannel,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeChannelRepository(dbConnection);

  const res = await repo.updateOne({ channelId: data.channelId }, data);
  if (!res.modifiedCount) await repo.create(data);
}

export async function softDeleteChannel(
  guildId: Snowflake,
  data: IChannel,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeChannelRepository(dbConnection);
  await repo.updateOne(
    { channelId: data.channelId },
    { deletedAt: new Date() },
  );
}

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

export async function createRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);

  try {
    await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, roleId: data.roleId }, 'Role already exists');
    } else {
      throw err;
    }
  }
}

export async function updateRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);

  const res = await repo.updateOne({ roleId: data.roleId }, data);
  if (!res.modifiedCount) await repo.create(data);
}

export async function softDeleteRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);
  await repo.updateOne({ roleId: data.roleId }, { deletedAt: new Date() });
}

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
