import { Connection, IPlatform, Platform } from '@togethercrew.dev/db';
import { MongoService } from './MongoService';
import mongoose, { HydratedDocument } from 'mongoose';

export class PlatformService extends MongoService {
  public async findById(
    id: string,
  ): Promise<HydratedDocument<IPlatform | null>> {
    try {
      return await Platform.findById(id).exec();
    } catch (error) {
      console.error('Failed to get platform', error);
      throw error;
    }
  }
}
