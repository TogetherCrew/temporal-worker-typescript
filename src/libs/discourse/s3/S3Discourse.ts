import Bottleneck from 'bottleneck';
import { S3_NUM_PARTITIONS } from '../../../shared/s3';
import { GzipCompressor } from '../../s3/GzipCompressor';
import { S3ClientWrapper } from '../../s3/S3ClientWrapper';
import * as crypto from 'crypto';
import { config } from '../../../config';

export const DISCOURSE_ROOT = 'discourse';

type DiscourseType = 'topics' | 'posts' | 'users' | 'actions' | 'other';

const defaultConfig = {
  datastore: 'ioredis',
  clearDatastore: false,
  clientOptions: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASS,
  },
  maxConcurrent: 50
}

export class S3Discourse {
  private readonly client: S3ClientWrapper;
  private readonly compressor: GzipCompressor;
  private readonly putLimiter: Bottleneck
  private readonly getLimiter: Bottleneck

  constructor() {
    this.client = new S3ClientWrapper();
    this.compressor = new GzipCompressor();

    this.getLimiter = new Bottleneck({ ...defaultConfig, id: 's3gzipLimiterGet' })
    this.putLimiter = new Bottleneck({ ...defaultConfig, id: 's3gzipLimiterPut' })
  }

  private generateId(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private getPartition(id: number | string): number {
    if (typeof id === 'string') {
      id = parseInt(id, 16);
    }
    return id % S3_NUM_PARTITIONS;
  }

  private getKey(
    endpoint: string,
    type: DiscourseType,
    id: number | string,
  ): string {
    if (type === 'other') {
      return `${DISCOURSE_ROOT}/${endpoint}/${id}${this.compressor.fileExtension}`;
    }
    const partition = this.getPartition(id);
    return `${DISCOURSE_ROOT}/${endpoint}/${type}/${partition}/${id}${this.compressor.fileExtension}`;
  }

  public async put(
    endpoint: string,
    type: DiscourseType,
    id: number | string | undefined,
    data: any,
  ): Promise<string> {
    if (!id) {
      id = this.generateId(data);
    }
    const key = this.getKey(endpoint, type, id);
    const body = this.compressor.compress(data);
    await this.putLimiter.schedule(() => this.client.put(key, body, this.compressor.encoding));
    return key;
  }
  public async get(
    endpoint: string,
    type: DiscourseType,
    id: number | string,
  ): Promise<any> {
    const key = this.getKey(endpoint, type, id);
    return this.getLimiter.schedule(() => this.getByKey(key));
  }
  public async list(Prefix: string, Delimiter?: string): Promise<string[]> {
    const { CommonPrefixes } = await this.getLimiter.schedule(() => this.client.list(
      `${DISCOURSE_ROOT}/${Prefix}`,
      Delimiter,
    ));

    if (CommonPrefixes) {
      return CommonPrefixes.map((obj) => obj.Prefix).filter(
        (prefix): prefix is string => typeof prefix === 'string',
      );
    }
    return [];
  }

  public async putFixedKey(
    endpoint: string,
    path: string,
    data: any,
  ): Promise<string> {
    const key = `${DISCOURSE_ROOT}/${endpoint}/${path}`;
    const body = this.compressor.compress(data);
    await this.putLimiter.schedule(() => this.client.put(key, body, this.compressor.encoding));
    return key;
  }

  public async getByKey(key: string): Promise<any> {
    const bytes = await this.client.get(key);
    if (bytes) {
      return this.compressor.decompress(bytes);
    } else {
      throw new Error('Undefined payload.');
    }
  }
}
