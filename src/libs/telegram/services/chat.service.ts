import { Chat } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_OR_UPDATE_CHAT } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';

class ChatService {
  async createOrUpdate(chat: Chat, tx?: Transaction): Promise<void> {
    if (tx) {
      tx.run(CREATE_OR_UPDATE_CHAT, { chat });
    } else {
      await neo4jService.run(CREATE_OR_UPDATE_CHAT, { chat });
    }
  }
}

export const chatService = new ChatService();
