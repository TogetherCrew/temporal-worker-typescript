import Bottleneck from 'bottleneck';
import { GzipCompressor } from './GzipCompressor';
import { S3ClientWrapper } from './S3ClientWrapper';
import { config } from '../../config';

const defaultConfig: Bottleneck.ConstructorOptions = {
  datastore: 'ioredis',
  clearDatastore: true,
  clientOptions: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASS,
    db: 1,
  },
  maxConcurrent: 50,
};

export class S3Gzip {
  private readonly c: GzipCompressor;
  private readonly client: S3ClientWrapper;
  private readonly putLimiter: Bottleneck;
  private readonly getLimiter: Bottleneck;

  constructor() {
    this.c = new GzipCompressor();
    this.client = new S3ClientWrapper();

    this.getLimiter = new Bottleneck({
      ...defaultConfig,
      id: 's3gzipLimiterGet',
    });
    this.putLimiter = new Bottleneck({
      ...defaultConfig,
      id: 's3gzipLimiterPut',
    });
  }

  public async put(key: string, data: object): Promise<boolean> {
    const body = this.c.compress(data);
    return this.putLimiter.schedule(() =>
      this.client.put(key, body, this.c.encoding),
    );
  }

  public async get(key: string): Promise<object> {
    const body = await this.getLimiter.schedule(() => this.client.get(key));
    return this.c.decompress(body);
  }

  public async list(
    prefix: string,
    delimiter = this.c.fileExtension,
  ): Promise<string[]> {
    const { CommonPrefixes } = await this.getLimiter.schedule(() =>
      this.client.list(prefix, delimiter),
    );
    if (CommonPrefixes) {
      return CommonPrefixes.map((obj) => obj.Prefix).filter(
        (prefix): prefix is string => typeof prefix === 'string',
      );
    }
    return [];
  }
}
