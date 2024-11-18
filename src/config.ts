import dotenv from 'dotenv';
import Joi from 'joi';
import { EnvConfig } from './shared/config';
import { QUEUE } from './shared/queues';

dotenv.config();

const schema = Joi.object({
  S3_API_KEY: Joi.string().required(),
  S3_API_SECRET: Joi.string().required(),
  S3_ENDPOINT: Joi.string().default(null),
  S3_REGION: Joi.string().required().default('us-east-1'),
  S3_BUCKET_NAME: Joi.string().required(),
  PROXY_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASS: Joi.string().default(null),
  TEMPORAL_URI: Joi.string().required().default('localhost:7233'),
  NEO4J_URI: Joi.string().required().default('neo4j://localhost:7687'),
  NEO4J_USER: Joi.string().required().default('neo4j'),
  NEO4J_PASS: Joi.string().required().default('password'),
  QUEUE: Joi.string()
    .required()
    .valid(...Object.values(QUEUE))
    .default(QUEUE.HEAVY),
  DB_HOST: Joi.string().required().description('MongoDB Host'),
  DB_PORT: Joi.string().required().description('MongoDB Port'),
  DB_USER: Joi.string().required().description('MongoDB Username'),
  DB_PASSWORD: Joi.string().required().description('MongoDB Password'),
  DB_NAME: Joi.string().required().description('Mongo DB name'),
  AIRFLOW_URI: Joi.string().required().description('Airflow URI'),
  AIRFLOW_USER: Joi.string().required().description('Airflow Username'),
  AIRFLOW_PASS: Joi.string().required().description('Airflow Password'),
})
  .unknown()
  .required();

const { error, value } = schema.validate(process.env);

if (error) {
  console.error('Failed config validation', error);
  throw error;
}

export const config: EnvConfig = value;
