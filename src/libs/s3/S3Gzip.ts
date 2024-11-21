import { GzipCompressor } from "./GzipCompressor";
import { S3ClientWrapper } from "./S3ClientWrapper";

export class S3Gzip {
  private readonly c: GzipCompressor
  private readonly client: S3ClientWrapper;

  constructor() {
    this.c = new GzipCompressor()
    this.client = new S3ClientWrapper()
  }

  public async put(key: string, data: object): Promise<boolean> {
    const body = this.c.compress(data)
    return this.client.put(key, body, this.c.encoding)
  }

  public async get(key: string): Promise<object> {
    return this.client.get(key)
  }
}