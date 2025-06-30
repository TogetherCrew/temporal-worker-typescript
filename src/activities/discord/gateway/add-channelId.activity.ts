import { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import { DatabaseManager, makeThreadRepository } from '@togethercrew.dev/db';

export async function getChannelIdFromThread(
  data: GatewayMessageCreateDispatchData,
) {
  try {
    let channelId: string;
    const dbConnection = await DatabaseManager.getInstance().getGuildDb(
      data.guild_id,
    );
    const threadRepository = makeThreadRepository(dbConnection);
    channelId = (await threadRepository.findOne({ id: data.channel_id }))
      .parent_id;
    return channelId;
  } catch (error) {
    console.error('Error in getChannelIdFromThread:', error);
    throw error;
  }
}
