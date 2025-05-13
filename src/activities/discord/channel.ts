import { Snowflake } from 'discord.js';
import {
  DatabaseManager,
  makeChannelRepository,
  IChannel,
} from '@togethercrew.dev/db';
import parentLogger from '../../config/logger.config';
const logger = parentLogger.child({ activity: 'discord:channel' });

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

  const res = await repo.updateOne(
    { channelId: data.channelId },
    { ...data, deletedAt: null },
  );
  if (!res.modifiedCount) await repo.create(data);
}

export async function softDeleteChannel(
  guildId: Snowflake,
  data: IChannel,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  // const repo = makeChannelRepository(dbConnection);
  // const doc = await repo.findOne({ channelId });

  console.log(await dbConnection.models.Channel.find({}));
  const doc = await dbConnection.models.Channel.findOne({ channelId: data.channelId });
  await doc?.softDelete();
}
