import { Chat, Message, MessageEntity } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_MENTIONED } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';

class MentionedService {
  async create(
    chat: Chat,
    message: Message,
    mentions: MessageEntity[],
    tx?: Transaction,
  ): Promise<any> {
    if (tx) {
      tx.run(CREATE_MENTIONED, { chat, message, mentions });
    } else {
      await neo4jService.run(CREATE_MENTIONED, {
        chat,
        message,
        mentions,
      });
    }
  }
}

export const mentionedService = new MentionedService();
