import Bottleneck from 'bottleneck';
import { config } from '../../config';
import { createLimiter } from '../bottleneck/createLimiter';

export class BottleneckService {
  private readonly limiters: Map<string, Bottleneck> = new Map();
  private defaultOptions: Bottleneck.ConstructorOptions;

  constructor() {
    this.defaultOptions = {
      datastore: 'ioredis',
      clearDatastore: true,
      clientOptions: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        password: config.REDIS_PASS,
        db: 0,
      },
    };
  }

  setLimiter(key: string, limiter: Bottleneck) {
    this.limiters.set(key, limiter);
  }

  deleteLimiter(key: string): boolean {
    const limiter = this.getLimiter(key);
    if (limiter) {
      limiter.disconnect();
    }
    return this.limiters.delete(key);
  }

  getLimiter(key: string): Bottleneck | undefined {
    return this.limiters.get(key);
  }

  createClusterLimiter(key: string, options: any): Bottleneck {
    const limiter: Bottleneck = createLimiter({ id: key }, { db: 0 })
    return limiter;
  }
}
