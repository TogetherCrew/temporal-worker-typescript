import { FilterQuery } from 'mongoose';

import { Community, IPlatform, Platform } from '@togethercrew.dev/db';

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

    console.log('filter', filter);

    const platform = await Platform.findOne(filter);

    console.log('platform', platform);

    const community = await Community.findOne({ _id: platform.community });

    console.log('community', community);
    return community;
  } catch (error) {
    console.error(error);
    return null;
  }
}
