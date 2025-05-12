import neo4j, {
  Driver,
  RecordShape,
  Result,
  Session,
  Transaction,
} from 'neo4j-driver';
import { ConfigService } from '../../config/config.service';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'Neo4jClient' });

export class Neo4jClient {
  public readonly driver: Driver;
  private readonly configService = ConfigService.getInstance();
  private readonly neo4jConfig;

  constructor() {
    this.neo4jConfig = this.configService.get('neo4j');
    this.driver = neo4j.driver(
      this.neo4jConfig.URI,
      neo4j.auth.basic(this.neo4jConfig.USER, this.neo4jConfig.PASS),
    );
  }

  public async run(cypher: string, params?: any): Promise<Result<RecordShape>> {
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, params);
      return result;
    } catch (error) {
      logger.error({ error, cypher }, 'Failed to run cypher');
      throw error;
    } finally {
      await session.close();
    }
  }

  public async beginTransaction() {
    const session = this.driver.session();
    return session.beginTransaction();
  }
}

export const neo4jService = new Neo4jClient();
