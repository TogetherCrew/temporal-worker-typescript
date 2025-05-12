import dotenv from 'dotenv';
import { envSchema, EnvConfig } from './schema';
import { transformEnv } from './transform';

export class ConfigService {
  private static instance: ConfigService;
  private readonly config: EnvConfig;

  /** Hide ctor – use getInstance() */
  private constructor() {
    // Load .env first
    dotenv.config({
      path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    });

    // Transform and validate in one step
    const result = envSchema.safeParse(transformEnv(process.env));
    if (!result.success) {
      // Pretty‑print Zod issues but keep original interface intact
      console.error(
        { issues: result.error.issues },
        'Config validation error – aborting start‑up',
      );
      throw new Error('Invalid environment variables');
    }

    this.config = result.data;
  }

  /** Global accessor – no change to calling code */
  public static getInstance(): ConfigService {
    return (this.instance ??= new ConfigService());
  }

  /** First‑level key getter (unchanged interface) */
  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}
