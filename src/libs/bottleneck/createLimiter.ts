import Bottleneck from 'bottleneck';
import { RedisOptions } from 'ioredis';
import { redisService } from '../redis/RedisService';

export function createLimiter(
  bottleneckOptions?: Bottleneck.ConstructorOptions,
  db?: number,
) {
  const redisClient = redisService.get(db);
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
