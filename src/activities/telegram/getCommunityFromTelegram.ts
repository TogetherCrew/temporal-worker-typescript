import { FilterQuery } from 'mongoose';
import { Community, IPlatform, Platform } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'getCommunityFromTelegram' });

export async function getCommunityFromTelegram(
  chatId: string | number,
): Promise<object | null> {
  try {
    const filter: FilterQuery<IPlatform> = {
      name: 'telegram',
      'metadata.chat.id': chatId,
      'metadata.token': { $ne: null },
      'metadata.disconnectedAt': null,
    };

    logger.debug('filter', filter);

    const platform = await Platform.findOne(filter);

    logger.debug('platform', platform);

    const community = await Community.findOne({ _id: platform.community });

    logger.debug('community', community);
    return community;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
