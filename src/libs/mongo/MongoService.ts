import mongoose from 'mongoose';
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
      '?authSource=admin',
    ].join('');

    mongoose.connection.on('connected', () =>
      console.log('Mongoose connected successfully.'),
    );
    mongoose.connection.on('error', (error) =>
      console.error(`Mongoose connection error: ${error}`),
    );
  }

  public async connect() {
    try {
      await mongoose.connect(this.uri);
      console.log('Mongo connected.', this.uri);
    } catch (error) {
      console.error('Failed to connect to mongo.', (error as Error).message);
      throw error;
    }
  }

  public async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Mongo disconnected.');
    } catch (error) {
      console.error('Failed to disconnect to mongo.', (error as Error).message);
      throw error;
    }
  }
}
