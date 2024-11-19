import { config } from '../../config';

export class MongoService {
  protected uri: string;

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
      '&directConnection=true',
    ].join('');
  }
}
