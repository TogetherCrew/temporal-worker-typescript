import mongoose, { mongo } from 'mongoose';
import { config } from '../../config';

export class MongoService {
  private uri: string;

  constructor() {
    this.uri = [
      'mongodb://',
      config.DB_USER,
      ':',
      config.DB_PASSWORD,
      '@',
      config.DB_HOST,
      ':',
      config.DB_PORT,
      '/',
      config.DB_NAME,
    ].join('');
  }

  public async connect() {
    try {
      return mongoose.connect(this.uri);
    } catch (error) {
      console.error('Failed to connect to mongo.', (error as Error).message);
      throw error;
    }
  }

  public async disconnect() {
    try {
      return mongoose.disconnect();
    } catch (error) {
      console.error('Failed to disconnect to mongo.', (error as Error).message);
      throw error;
    }
  }
}
