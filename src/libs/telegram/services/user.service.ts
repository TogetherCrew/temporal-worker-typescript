import { User } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { CREATE_OR_UPDATE_USER } from '../neo4j/cyphers';

class UserService {
  async createOrUpdate(user: User, tx?: Transaction): Promise<void> {
    if (tx) {
      tx.run(CREATE_OR_UPDATE_USER, { user });
    } else {
      await neo4jService.run(CREATE_OR_UPDATE_USER, { user });
    }
  }
}

export const userService = new UserService();
