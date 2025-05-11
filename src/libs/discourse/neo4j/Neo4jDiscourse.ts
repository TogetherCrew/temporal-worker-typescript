import { Neo4jClient } from '../../neo4j/Neo4jClient';
import {
  DiscourseNeo4jAction,
  DiscourseNeo4jPost,
  DiscourseNeo4jTopic,
  DiscourseNeo4jUser,
  DiscourseNeo4jCategory,
} from 'src/shared/types';
import { CREATE_POSTS_APOC } from './cyphers/posts';
import { CREATE_TOPICS_APOC } from './cyphers/topics';
import { CREATE_ACTION_LIKED } from './cyphers/actions/liked';
import { CREATE_ACTION_MENTIONED } from './cyphers/actions/mentioned';
import { CREATE_ACTION_REPLIED_TO } from './cyphers/actions/repliedTo';
import { CREATE_ACTION_RESPONDED } from './cyphers/actions/responded';
import { CREATE_ACTION_QUOTED } from './cyphers/actions/quoted';
import { CREATE_USERS_APOC } from './cyphers/users';
import { CREATE_CATEGORIES_APOC } from './cyphers/categories';
import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ module: 'Neo4jDiscourse' });

export class Neo4jDiscourse extends Neo4jClient {
  public async createPostsApoc(data: DiscourseNeo4jPost[]) {
    await this.run(CREATE_POSTS_APOC, { data });
  }

  public async createTopicsApoc(data: DiscourseNeo4jTopic[]) {
    await this.run(CREATE_TOPICS_APOC, { data });
  }

  public async createUsersApoc(data: DiscourseNeo4jUser[]) {
    await this.run(CREATE_USERS_APOC, { data });
  }

  public async createActions(data: DiscourseNeo4jAction[]) {
    const session = this.driver.session();
    const tx = session.beginTransaction();
    try {
      data.map((action) => {
        switch (action.actionType) {
          case 1:
            tx.run(CREATE_ACTION_LIKED, { action });
            break;
          case 5:
            tx.run(CREATE_ACTION_REPLIED_TO, { action });
            break;
          case 6:
            tx.run(CREATE_ACTION_RESPONDED, { action });
            break;
          case 7:
            tx.run(CREATE_ACTION_MENTIONED, { action });
            break;
          case 9:
            tx.run(CREATE_ACTION_QUOTED, { action });
            break;
          default:
            break;
        }
      });
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      logger.error({ error }, 'Failed to commit tx');
      throw error;
    } finally {
      await session.close();
    }
  }

  public async createCategories(data: DiscourseNeo4jCategory[]) {
    logger.debug({ cypher: CREATE_CATEGORIES_APOC }, 'Creating categories');
    await this.run(CREATE_CATEGORIES_APOC, { data });
  }
}
