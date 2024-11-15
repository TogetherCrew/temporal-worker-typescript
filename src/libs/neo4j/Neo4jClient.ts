import neo4j, { Driver } from 'neo4j-driver';
import { config } from '../../config';

export class Neo4jClient {
  protected readonly driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      config.NEO4J_URI,
      neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASS),
    );
  }

  protected async run(cypher: string, params?: any) {
    const session = this.driver.session();
    try {
      await session.run(cypher, params);
    } catch (error) {
      console.error('Failed to run cypher', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}
