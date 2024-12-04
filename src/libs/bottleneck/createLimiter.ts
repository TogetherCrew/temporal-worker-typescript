import Bottleneck from 'bottleneck';
import { RedisOptions } from 'ioredis';
import { createRedisClient } from '../redis/createRedisClient';

export function createLimiter(
  bottleneckOptions?: Bottleneck.ConstructorOptions,
  redisOptions?: RedisOptions,
) {
  const redisClient = createRedisClient(redisOptions);
  const limiter = new Bottleneck({
    clearDatastore: false,
    maxConcurrent: 50,
    Redis: redisClient,
    ...bottleneckOptions,
  });

  limiter.on('error', function (error) {
    console.error('Limiter error', bottleneckOptions, error);
    throw error;
  });

  return limiter;
}
