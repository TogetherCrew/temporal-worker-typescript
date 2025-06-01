import dotenv from 'dotenv';

import { EnvConfig, envSchema } from './schema';
import { transformEnv } from './transform';

export class ConfigService {
  private static instance: ConfigService;
  private readonly config: EnvConfig;

  private constructor() {
    dotenv.config({
      path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    });

    const result = envSchema.safeParse(transformEnv(process.env));
    if (!result.success) {
      console.error(
        { issues: result.error.issues },
        'Config validation error – aborting start‑up',
      );
      throw new Error('Invalid environment variables');
    }

    this.config = result.data;
  }

  public static getInstance(): ConfigService {
    return (this.instance ??= new ConfigService());
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}
