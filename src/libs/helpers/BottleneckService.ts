import Bottleneck from 'bottleneck';
import { config } from '../../config';

export class BottleneckService {
  private readonly limiters: Map<string, Bottleneck> = new Map();
  private defaultOptions: Bottleneck.ConstructorOptions;

  constructor() {
    this.defaultOptions = {
      datastore: 'ioredis',
      clearDatastore: false,
      clientOptions: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
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
    const limiter: Bottleneck = new Bottleneck({
      ...this.defaultOptions,
      ...options,
      id: key,
    });

    return limiter;
  }
}
