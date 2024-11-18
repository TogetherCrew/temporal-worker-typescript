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
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  AIRFLOW_URI: string;
  AIRFLOW_USER: string;
  AIRFLOW_PASS: string;
}
