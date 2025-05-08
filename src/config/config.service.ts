import dotenv from 'dotenv';
import { envSchema, EnvConfig } from './schema';
import { transformEnv } from './transform';

export class ConfigService {
  private static instance: ConfigService;
  private readonly config: EnvConfig;

  private constructor() {
    dotenv.config({
      path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    });

    const parsedEnv = transformEnv(process.env);
    const result = envSchema.safeParse(parsedEnv);

    if (!result.success) {
      console.error('Config validation error:', result.error.format());
      throw new Error('Invalid environment variables');
    }

    this.config = result.data;
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}
