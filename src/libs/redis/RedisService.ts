import Redis, { RedisOptions } from 'ioredis';
import { ConfigService } from '../../config/config.service';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'RedisService' });
const configService = ConfigService.getInstance();
const redisConfig = configService.get('redis');

const redisOptions: RedisOptions = {
  host: redisConfig.HOST,
  port: redisConfig.PORT,
  password: redisConfig.PASS,
  retryStrategy: (n: number) => Math.min(n * 100, 3000),
  reconnectOnError: (err: Error) => {
    if (err.message.includes('ERR UNKNOWN_CLIENT')) {
      logger.warn('Redis error: ERR UNKNOWN_CLIENT. Reconnecting...');
      return true;
    }
    return false;
  },
};

class RedisService {
  private readonly clients: Map<number, Redis> = new Map();

  constructor() {
    const cleanup = () => {
      logger.info('Closing Redis connections...');
      this.clients.forEach((c) => c.quit());
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  private set(db: number) {
    const client = new Redis({ ...redisOptions, db });

    client.on('error', (err) => {
      logger.error('Redis error:', err.message);
    });
    client.on('connect', () => {
      logger.info('Redis client connected');
    });
    client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting...');
    });
    this.clients.set(db, client);
    return client;
  }

  public get(db = 0): Redis {
    let client = this.clients.get(db);
    if (client === undefined) {
      client = this.set(db);
    }
    return client;
  }
}

export const redisService = new RedisService();
