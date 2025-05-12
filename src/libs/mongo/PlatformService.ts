import { Connection, IPlatform, Platform } from '@togethercrew.dev/db';
import { MongoService } from './MongoService';
import mongoose, { HydratedDocument } from 'mongoose';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'PlatformService' });

export class PlatformService extends MongoService {
  public async findById(
    id: string,
  ): Promise<HydratedDocument<IPlatform | null>> {
    try {
      return await Platform.findById(id).exec();
    } catch (error) {
      logger.error({ error, id }, 'Failed to get platform');
      throw error;
    }
  }
}
