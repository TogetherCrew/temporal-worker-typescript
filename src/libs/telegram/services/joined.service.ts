import { Chat, User } from 'grammy/types';
import { QueryResult, RecordShape, Result, Transaction } from 'neo4j-driver';
import { JOINED_COUNT, CREATE_JOINED } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';

class JoinedService {
  async count(chat: Chat, user: User, tx?: Transaction): Promise<number> {
    let result: QueryResult<RecordShape> | Result<RecordShape>;
    if (tx) {
      result = await tx.run(JOINED_COUNT, { chat, user });
    } else {
      result = await neo4jService.run(JOINED_COUNT, { chat, user });
    }
    return result.records[0].get('count');
  }

  async create(
    chat: Chat,
    user: User,
    date: number = 0,
    tx?: Transaction,
  ): Promise<any> {
    if (tx) {
      tx.run(CREATE_JOINED, { chat, user, date });
    } else {
      await neo4jService.run(CREATE_JOINED, { chat, user, date });
    }
  }
}

export const joinedService = new JoinedService();
