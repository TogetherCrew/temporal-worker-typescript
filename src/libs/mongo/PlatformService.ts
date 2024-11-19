import { Connection, IPlatform, Platform } from '@togethercrew.dev/db';
import { MongoService } from './MongoService';
import mongoose, { HydratedDocument } from 'mongoose';

export class PlatformService extends MongoService {
  public async findById(
    id: string,
  ): Promise<HydratedDocument<IPlatform | null>> {
    try {
      const result = await Platform.findById(id).exec();
      console.debug(result);
      return result;
    } catch (error) {
      console.error('Failed to get platform', error);
      throw error;
    }
  }
}
