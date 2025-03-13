import { FilterQuery } from 'mongoose';

import {
  IPlatform,
  Platform,
} from '@togethercrew.dev/db';

export async function getCommunityFromTelegram(
  chatId: string | number,
): Promise<object> {
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
    return platform.community
  } catch (error) {
    console.error(error);
    return null;
  }
}
