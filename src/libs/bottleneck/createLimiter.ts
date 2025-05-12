import Bottleneck from 'bottleneck';
import { RedisOptions } from 'ioredis';
import { redisService } from '../redis/RedisService';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'createLimiter' });

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
    logger.error({ error, bottleneckOptions }, 'Limiter error');
    throw error;
  });

  return limiter;
}
