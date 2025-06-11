import { Snowflake } from 'discord.js';
import { FilterQuery } from 'mongoose';

import {
    DatabaseManager, IChannel, IChannelUpdateBody, IGuildMember, IGuildMemberUpdateBody, IRawInfo,
    IRawInfoUpdateBody, IRole, IRoleUpdateBody, IThread, makeChannelRepository,
    makeGuildMemberRepository, makeRawInfoRepository, makeRoleRepository, makeThreadRepository,
    ThreadUpdateBody
} from '@togethercrew.dev/db';

import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ activity: 'discord:event:persistence' });

async function handleDuplicateKeyError<T>(
  operation: () => Promise<T>,
  entityName: string,
  entityId: string,
  guildId: Snowflake,
): Promise<T | void> {
  try {
    return await operation();
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, entityId }, `${entityName} already exists`);
    } else {
      throw err;
    }
  }
}

async function performUpsert<TData, TUpdateData>(
  guildId: Snowflake,
  repositoryFactory: (db: any) => any,
  filter: FilterQuery<TData>,
  updateData: TUpdateData,
  entityName: string,
): Promise<void> {
  try {
    const dbConnection =
      await DatabaseManager.getInstance().getGuildDb(guildId);
    const repository = repositoryFactory(dbConnection);
    const result = await repository.updateOne(filter, updateData);

    if (!result.modifiedCount) {
      await repository.create(updateData);
    }
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, filter }, `${entityName} already exists`);
    } else {
      logger.error(
        { err, guildId, filter },
        `Failed to update ${entityName.toLowerCase()}`,
      );
      throw err;
    }
  }
}

export async function createChannel(
  guildId: Snowflake,
  data: IChannel,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repository = makeChannelRepository(dbConnection);

  await handleDuplicateKeyError(
    () => repository.create(data),
    'Channel',
    data.channelId,
    guildId,
  );
}

export async function updateChannel(
  guildId: Snowflake,
  filter: FilterQuery<IChannel>,
  data: IChannelUpdateBody,
): Promise<void> {
  await performUpsert(guildId, makeChannelRepository, filter, data, 'Channel');
}

export async function createMember(
  guildId: Snowflake,
  data: IGuildMember,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repository = makeGuildMemberRepository(dbConnection);

  await handleDuplicateKeyError(
    () => repository.create(data),
    'Member',
    data.discordId,
    guildId,
  );
}

export async function updateMember(
  guildId: Snowflake,
  filter: FilterQuery<IGuildMember>,
  data: IGuildMemberUpdateBody,
): Promise<void> {
  await performUpsert(
    guildId,
    makeGuildMemberRepository,
    filter,
    data,
    'Member',
  );
}

export async function createRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repository = makeRoleRepository(dbConnection);

  await handleDuplicateKeyError(
    () => repository.create(data),
    'Role',
    data.roleId,
    guildId,
  );
}

export async function updateRole(
  guildId: Snowflake,
  filter: FilterQuery<IRole>,
  data: IRoleUpdateBody,
): Promise<void> {
  await performUpsert(guildId, makeRoleRepository, filter, data, 'Role');
}

export async function createRawInfo(
  guildId: Snowflake,
  data: IRawInfo,
): Promise<void> {
  try {
    const dbConnection =
      await DatabaseManager.getInstance().getGuildDb(guildId);
    const repository = makeRawInfoRepository(dbConnection);
    await repository.create(data);
    logger.debug(
      { guildId, messageId: data.messageId },
      'Created rawinfo document',
    );
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn(
        { guildId, messageId: data.messageId },
        'RawInfo already exists',
      );
    } else {
      logger.error(
        { err, guildId, messageId: data.messageId },
        'Failed to create rawinfo',
      );
      throw err;
    }
  }
}

export async function updateRawInfo(
  guildId: Snowflake,
  filter: FilterQuery<IRawInfo>,
  data: IRawInfoUpdateBody,
): Promise<void> {
  await performUpsert(guildId, makeRawInfoRepository, filter, data, 'RawInfo');
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

export async function createThread(
  guildId: Snowflake,
  data: IThread,
): Promise<void> {
  try {
    const dbConnection =
      await DatabaseManager.getInstance().getGuildDb(guildId);
    const repository = makeThreadRepository(dbConnection);
    await repository.create(data);
    logger.debug({ guildId, threadId: data.id }, 'Created thread');
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, threadId: data.id }, 'Thread already exists');
    } else {
      logger.error(
        { err, guildId, threadId: data.id },
        'Failed to create thread',
      );
      throw err;
    }
  }
}

export async function updateThread(
  guildId: Snowflake,
  filter: FilterQuery<IThread>,
  data: ThreadUpdateBody,
): Promise<void> {
  await performUpsert(guildId, makeThreadRepository, filter, data, 'Thread');
}

export async function deleteThread(
  guildId: Snowflake,
  threadId: Snowflake,
): Promise<void> {
  try {
    const db = await DatabaseManager.getInstance().getGuildDb(guildId);
    const repo = makeThreadRepository(db);
    const result = await repo.deleteMany({ id: threadId });

    if (result.deletedCount === 0) {
      logger.warn({ guildId, threadId }, 'No thread found to delete');
    } else {
      logger.debug({ guildId, threadId }, 'Deleted thread');
    }
  } catch (err: any) {
    logger.error({ err, guildId, threadId }, 'Failed to delete thread');
    throw err;
  }
}
