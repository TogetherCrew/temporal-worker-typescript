import { FilterQuery } from 'mongoose';

import { IPlatform, Platform } from '@togethercrew.dev/db';

export async function getPlatform(
  filter: FilterQuery<IPlatform>,
): Promise<IPlatform | null> {
  try {
    const platform = await Platform.findOne(filter);
    return platform;
  } catch (error) {
    console.error(error);
    return null;
  }
}
