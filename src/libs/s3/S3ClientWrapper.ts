import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { config } from '../../config';
import { createHash } from 'crypto';

export class S3ClientWrapper {
  private readonly s3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.S3_REGION,
      endpoint: config.S3_ENDPOINT,
      credentials: {
        accessKeyId: config.S3_API_KEY,
        secretAccessKey: config.S3_API_SECRET,
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
    Bucket = config.S3_BUCKET_NAME,
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
    Bucket = config.S3_BUCKET_NAME,
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
        // console.debug(`Put object in S3 with key ${Key}`);
        return true;
      } catch (error) {
        console.error(`Failed to put object:`, error);
        throw error;
      }
    } else {
      // Aim: save space on s3 as the objects are versioned.
      console.log('Skipping. No change detected.', { Key });
    }
  }

  public async get(
    Key: string,
    Bucket = config.S3_BUCKET_NAME,
  ): Promise<Uint8Array | undefined> {
    const getCommand = new GetObjectCommand({
      Bucket,
      Key,
    });
    try {
      const response = await this.s3Client.send(getCommand);
      // console.debug(`Get object in S3 with key ${Key}`);
      return response.Body?.transformToByteArray();
    } catch (error) {
      console.error(`Failed to get object:`, error);
      throw error;
    }
  }

  public async list(
    Prefix: string,
    Delimiter = '/',
    Bucket = config.S3_BUCKET_NAME,
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
      console.error(
        `Failed to list objects in ${Prefix} with ${Delimiter}:`,
        error,
      );
      throw error;
    }
  }
}
