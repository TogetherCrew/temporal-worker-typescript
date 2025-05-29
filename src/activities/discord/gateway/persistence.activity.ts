import { Snowflake } from 'discord.js';
import { FilterQuery } from 'mongoose';

import {
    DatabaseManager, IChannel, IChannelUpdateBody, IGuildMember, IGuildMemberUpdateBody, IRawInfo,
    IRawInfoUpdateBody, IRole, IRoleUpdateBody, makeChannelRepository, makeGuildMemberRepository,
    makeRawInfoRepository, makeRoleRepository
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
  filter: FilterQuery<IChannel>,
  data: IChannelUpdateBody,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeChannelRepository(dbConnection);

  const res = await repo.updateOne(filter, data);
  if (!res.modifiedCount) await repo.create(data);
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
  filter: FilterQuery<IGuildMember>,
  data: IGuildMemberUpdateBody,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeGuildMemberRepository(dbConnection);

  const res = await repo.updateOne(filter, data);
  if (!res.modifiedCount) await repo.create(data);
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
  filter: FilterQuery<IRole>,
  data: IRoleUpdateBody,
): Promise<void> {
  try {
    const dbConnection =
      await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRoleRepository(dbConnection);
    const res = await repo.updateOne(filter, data);
    if (!res.modifiedCount) await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, data }, 'Role already exists');
    } else {
      throw err;
    }
  }
}

// Message/RawInfo persistence functions
export async function createRawInfo(
  guildId: Snowflake,
  doc: IRawInfo,
): Promise<void> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRawInfoRepository(db);
    await repo.create(doc);
    logger.debug(
      { guildId, messageId: doc.messageId },
      'Created rawinfo document',
    );
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn(
        { guildId, messageId: doc.messageId },
        'RawInfo already exists',
      );
    } else {
      logger.error(
        { err, guildId, messageId: doc.messageId },
        'Failed to create rawinfo',
      );
      throw err;
    }
  }
}

export async function updateRawInfo(
  guildId: Snowflake,
  filter: FilterQuery<IRawInfo>,
  updateData: IRawInfoUpdateBody,
): Promise<void> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRawInfoRepository(db);
    const result = await repo.updateOne(filter, updateData);

    if (result.modifiedCount === 0) {
      logger.warn({ guildId, filter }, 'No rawinfo document found to update');
    } else {
      logger.debug({ guildId, filter }, 'Updated rawinfo document');
    }
  } catch (err: any) {
    logger.error({ err, guildId, filter }, 'Failed to update rawinfo');
    throw err;
  }
}


export async function deleteRawInfo(
  guildId: Snowflake,
  messageId: Snowflake,
): Promise<void> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRawInfoRepository(db);
    const result = await repo.deleteOne({ messageId });

    if (result.deletedCount === 0) {
      logger.warn(
        { guildId, messageId },
        'No rawinfo document found to delete',
      );
    } else {
      logger.debug({ guildId, messageId }, 'Deleted rawinfo document');
    }
  } catch (err: any) {
    logger.error({ err, guildId, messageId }, 'Failed to delete rawinfo');
    throw err;
  }
}

export async function deleteRawInfos(
  guildId: Snowflake,
  ids: Snowflake[],
): Promise<void> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRawInfoRepository(db);
    const result = await repo.deleteMany({ messageId: { $in: ids } });

    logger.debug(
      { guildId, deletedCount: result.deletedCount, totalIds: ids.length },
      'Bulk deleted rawinfo documents',
    );
  } catch (err: any) {
    logger.error(
      { err, guildId, messageIds: ids },
      'Failed to bulk delete rawinfo',
    );
    throw err;
  }
}

export async function getRawInfo(
  guildId: Snowflake,
  messageId: Snowflake,
): Promise<IRawInfo | null> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeRawInfoRepository(db);
    return await repo.findOne({ messageId });
  } catch (err: any) {
    logger.error({ err, guildId, messageId }, 'Failed to get rawinfo');
    throw err;
  }
}
