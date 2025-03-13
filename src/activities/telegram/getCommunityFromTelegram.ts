import { FilterQuery } from 'mongoose';

import {
  Community,
  IPlatform,
  Platform,
} from '@togethercrew.dev/db';

export async function getCommunityFromTelegram(
  chatId: string | number,
): Promise<object | null> {
  try {
    const filter: FilterQuery<IPlatform> = {
      name: 'telegram',
      metadata: {
        chat: {
          id: chatId,
        },
        token: { $ne: null },
        disconnectedAt: null,
      },
    };

    const platform = await Platform.findOne(filter)
    const community = await Community.findOne({ id: platform.community })
    return community
  } catch (error) {
    console.error(error);
    return null;
  }
}
