import Bottleneck from 'bottleneck';
import { createLimiter } from '../bottleneck/createLimiter';

export class BottleneckService {
  private readonly limiters: Map<string, Bottleneck> = new Map();

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
    const limiter: Bottleneck = createLimiter({ ...options, id: key });
    return limiter;
  }
}
