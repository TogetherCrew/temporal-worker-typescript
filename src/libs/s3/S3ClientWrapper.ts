import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '../../config/config.service';
import { createHash } from 'crypto';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'S3ClientWrapper' });

export class S3ClientWrapper {
  private readonly s3Client;
  private readonly configService = ConfigService.getInstance();
  private readonly s3Config;
  private readonly bucketName;

  constructor() {
    this.s3Config = this.configService.get('s3');
    this.bucketName = this.s3Config.BUCKET_NAME;

    this.s3Client = new S3Client({
      region: this.s3Config.REGION,
      endpoint: this.s3Config.ENDPOINT,
      credentials: {
        accessKeyId: this.s3Config.API_KEY,
        secretAccessKey: this.s3Config.API_SECRET,
      },
      forcePathStyle: true,
    });
  }

  private getObjectMD5(object: any): string {
    const hash = createHash('md5');
    const data = typeof object === 'string' ? object : JSON.stringify(object);
    return hash.update(data).digest('hex');
  }

  public async compare(
    Key: string,
    Body: any,
    Bucket = this.bucketName,
  ): Promise<boolean> {
    const cmd = new HeadObjectCommand({ Bucket, Key });
    try {
      const { ETag }: HeadObjectCommandOutput = await this.s3Client.send(cmd);
      const md5 = this.getObjectMD5(Body);
      return md5 === ETag;
    } catch (error) {
      return false;
    }
  }

  public async put(
    Key: string,
    Body: any,
    ContentType: string,
    Bucket = this.bucketName,
  ): Promise<boolean> {
    const putCommand = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType,
    });

    if (!(await this.compare(Key, Body, Bucket))) {
      try {
        await this.s3Client.send(putCommand);
        return true;
      } catch (error) {
        logger.error(`Failed to put object:`, error);
        throw error;
      }
    }
  }

  public async get(
    Key: string,
    Bucket = this.bucketName,
  ): Promise<Uint8Array | undefined> {
    const getCommand = new GetObjectCommand({
      Bucket,
      Key,
    });
    try {
      const response = await this.s3Client.send(getCommand);
      return response.Body?.transformToByteArray();
    } catch (error) {
      logger.error(`Failed to get object:`, error);
      throw error;
    }
  }

  public async list(
    Prefix: string,
    Delimiter = '/',
    Bucket = this.bucketName,
  ): Promise<ListObjectsV2CommandOutput> {
    try {
      const cmd = new ListObjectsV2Command({
        Bucket,
        Prefix,
        Delimiter,
      });
      const response = await this.s3Client.send(cmd);
      return response;
    } catch (error) {
      logger.error(
        `Failed to list objects in ${Prefix} with ${Delimiter}:`,
        error,
      );
      throw error;
    }
  }
}
