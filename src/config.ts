import dotenv from 'dotenv';
import Joi from 'joi';
import { EnvConfig } from './shared/config';
import { QUEUE } from './shared/queues';

dotenv.config();

const schema = Joi.object({
  S3_API_KEY: Joi.string().required(),
  S3_API_SECRET: Joi.string().required(),
  S3_ENDPOINT: Joi.string().optional().default(undefined),
  S3_REGION: Joi.string().required().default('us-east-1'),
  S3_BUCKET_NAME: Joi.string().required(),
  PROXY_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASS: Joi.string().optional().default(undefined),
  TEMPORAL_URI: Joi.string().required().default('localhost:7233'),
  NEO4J_URI: Joi.string().required().default('neo4j://localhost:7687'),
  NEO4J_USER: Joi.string().required().default('neo4j'),
  NEO4J_PASS: Joi.string().required().default('password'),
  QUEUE: Joi.string()
    .required()
    .valid(...Object.values(QUEUE))
    .default(QUEUE.HEAVY),
})
  .unknown()
  .required();

const { error, value } = schema.validate(process.env);

if (error) {
  console.error('Failed config validation', error);
  throw error;
}

export const config: EnvConfig = value;
