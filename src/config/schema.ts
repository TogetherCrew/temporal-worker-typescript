import { z } from 'zod';
import { QUEUE } from '../shared/queues';
import { LogLevel } from '../shared/constants/logger.constant';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  logger: z.object({
    LEVEL: z
      .enum(Object.values(LogLevel) as [string, ...string[]])
      .default(LogLevel.INFO),
  }),

  s3: z.object({
    API_KEY: z.string().nonempty(),
    API_SECRET: z.string().nonempty(),
    ENDPOINT: z.string().url().optional().nullable().default(null),
    REGION: z.string().nonempty().default('us-east-1'),
    BUCKET_NAME: z.string().nonempty(),
  }),

  proxy: z.object({
    URI: z.string().url(),
  }),

  redis: z.object({
    HOST: z.string().nonempty(),
    PORT: z.coerce.number().int().positive().default(6379),
    PASS: z.string().optional().nullable().default(null),
  }),

  temporal: z.object({
    URI: z.string().nonempty(),
    QUEUE: z
      .enum(Object.values(QUEUE) as [string, ...string[]])
      .default(QUEUE.HEAVY),
  }),

  neo4j: z.object({
    URI: z.string().nonempty(),
    USER: z.string().nonempty(),
    PASS: z.string().nonempty(),
  }),

  db: z.object({
    HOST: z.string().nonempty(),
    PORT: z.coerce.number().int().positive(),
    USER: z.string().nonempty(),
    PASSWORD: z.string().nonempty(),
    NAME: z.string().nonempty(),
    URI: z.string().nonempty().optional(),
  }),

  airflow: z.object({
    URI: z.string().nonempty(),
    USER: z.string().nonempty(),
    PASS: z.string().nonempty(),
  }),

  questionService: z.object({
    URI: z.string().url(),
  }),

  rmq: z.object({
    HOST: z.string().nonempty(),
    PORT: z.coerce.number().int().positive().default(5672),
    USER: z.string().nonempty(),
    PASS: z.string().nonempty(),
  }),

  MIN_QUESTION_SCORE: z.coerce.number().min(0).max(1).default(0.75),
});

export type EnvConfig = z.infer<typeof envSchema>;
