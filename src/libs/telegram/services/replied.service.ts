import { Chat, Message } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { neo4jService } from '../../neo4j/Neo4jClient';
import { CREATE_REPLIED } from '../neo4j/cyphers';

class RepliedService {
  async create(
    chat: Chat,
    message: Message,
    reply_to_message: Message,
    tx?: Transaction,
  ): Promise<any> {
    if (tx) {
      tx.run(CREATE_REPLIED, { chat, message, reply_to_message });
    } else {
      await neo4jService.run(CREATE_REPLIED, {
        chat,
        message,
        reply_to_message,
      });
    }
  }
}

export const repliedService = new RepliedService();
