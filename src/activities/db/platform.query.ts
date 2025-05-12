import { FilterQuery } from 'mongoose';

import { IPlatform, Platform } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'platform.query' });

export async function getPlatform(
  filter: FilterQuery<IPlatform>,
): Promise<IPlatform | null> {
  try {
    const platform = await Platform.findOne(filter);
    return platform;
  } catch (error) {
    logger.error({ error }, 'Error finding platform');
    return null;
  }
}
