import neo4j, {
  Driver,
  RecordShape,
  Result,
  Session,
  Transaction,
} from 'neo4j-driver';
import { config } from '../../config';

export class Neo4jClient {
  public readonly driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      config.NEO4J_URI,
      neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASS),
    );
  }

  public async run(cypher: string, params?: any): Promise<Result<RecordShape>> {
    const session = this.driver.session();
    try {
      return session.run(cypher, params);
    } catch (error) {
      console.error('Failed to run cypher', error);
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
