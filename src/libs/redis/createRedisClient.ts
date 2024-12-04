import Redis, { RedisOptions } from 'ioredis';
import { config } from '../../config';

const redisOptions: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASS,
  db: 1,
  retryStrategy: (n: number) => Math.min(n * 100, 3000),
  reconnectOnError: (err: Error) => {
    if (err.message.includes('ERR UNKNOWN_CLIENT')) {
      console.warn('Redis error: ERR UNKNOWN_CLIENT. Reconnecting...');
      return true;
    }
    return false;
  },
};

export function createRedisClient(options?: RedisOptions): Redis {
  const client = new Redis({ ...redisOptions, ...options });

  const cleanup = () => {
    console.log('Closing Redis connection...');
    client.quit();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
  client.on('connect', () => {
    console.log('Redis client connected');
  });
  client.on('reconnecting', () => {
    console.warn('Redis client reconnecting...');
  });

  return client;
}
