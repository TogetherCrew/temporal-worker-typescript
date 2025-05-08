import { QUEUE } from '../shared/queues';

export function transformEnv(env: NodeJS.ProcessEnv) {
  return {
    NODE_ENV: env.NODE_ENV,

    s3: {
      API_KEY: env.S3_API_KEY!,
      API_SECRET: env.S3_API_SECRET!,
      ENDPOINT: env.S3_ENDPOINT,
      REGION: env.S3_REGION!,
      BUCKET_NAME: env.S3_BUCKET_NAME!,
    },

    proxy: {
      URI: env.PROXY_URI!,
    },

    redis: {
      HOST: env.REDIS_HOST!,
      PORT: env.REDIS_PORT!,
      PASS: env.REDIS_PASS,
    },

    temporal: {
      URI: env.TEMPORAL_URI!,
      QUEUE: env.QUEUE as QUEUE,
    },

    neo4j: {
      URI: env.NEO4J_URI!,
      USER: env.NEO4J_USER!,
      PASS: env.NEO4J_PASS!,
    },

    db: {
      HOST: env.DB_HOST!,
      PORT: env.DB_PORT!,
      USER: env.DB_USER!,
      PASSWORD: env.DB_PASSWORD!,
      NAME: env.DB_NAME!,
      URI: `mongodb://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}?authSource=admin&directConnection=true`,
    },

    airflow: {
      URI: env.AIRFLOW_URI!,
      USER: env.AIRFLOW_USER!,
      PASS: env.AIRFLOW_PASS!,
    },

    questionService: {
      URI: env.QUESTION_SERVICE_URI!,
    },

    rmq: {
      HOST: env.RMQ_HOST!,
      PORT: env.RMQ_PORT!,
      USER: env.RMQ_USER!,
      PASS: env.RMQ_PASS!,
    },

    MIN_QUESTION_SCORE: env.MIN_QUESTION_SCORE!,
  };
}
