export interface EnvConfig {
  S3_API_KEY: string;
  S3_API_SECRET: string;
  S3_ENDPOINT?: string;
  S3_REGION: string;
  S3_BUCKET_NAME: string;
  PROXY_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASS?: string;
  TEMPORAL_URI: string;
  NEO4J_URI: string;
  NEO4J_USER: string;
  NEO4J_PASS: string;
  QUEUE: string;
}
