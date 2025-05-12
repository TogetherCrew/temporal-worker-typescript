import Bottleneck from 'bottleneck';
import { createLimiter } from '../bottleneck/createLimiter';
import parentLogger from '../../config/logger.config';

export class BottleneckService {
  private readonly limiters: Map<string, Bottleneck> = new Map();
  private readonly logger = parentLogger.child({ module: 'BottleneckService' });

  constructor() {
    const cleanup = () => {
      this.logger.info('Closing Redis connections...');
      this.limiters.forEach((l) => l.stop());
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  setLimiter(key: string, limiter: Bottleneck) {
    this.limiters.set(key, limiter);
  }

  async deleteLimiter(key: string): Promise<boolean> {
    if (this.limiters.has(key)) {
      const limiter = this.limiters.get(key);
      await limiter.disconnect();
      return this.limiters.delete(key);
    }
    return false;
  }

  getLimiter(key: string): Bottleneck | undefined {
    return this.limiters.get(key);
  }

  createClusterLimiter(key: string, options: any): Bottleneck {
    if (this.limiters.has(key)) {
      return this.limiters.get(key);
    }
    const limiter: Bottleneck = createLimiter({ ...options, id: key });
    this.setLimiter(key, limiter);
    return limiter;
  }
}
