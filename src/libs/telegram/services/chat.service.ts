import { Chat } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_OR_UPDATE_CHAT, MIGRATE_CHAT } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';

class ChatService {
  async createOrUpdate(chat: Chat, tx?: Transaction): Promise<void> {
    if (tx) {
      tx.run(CREATE_OR_UPDATE_CHAT, { chat });
    } else {
      await neo4jService.run(CREATE_OR_UPDATE_CHAT, { chat });
    }
  }

  async migrateChat(
    oldChatId: string | number,
    newChatId: string | number,
    tx?: Transaction,
  ) {
    if (tx) {
      tx.run(MIGRATE_CHAT, { oldChatId, newChatId });
    } else {
      await neo4jService.run(MIGRATE_CHAT, { oldChatId, newChatId });
    }
  }
}

export const chatService = new ChatService();
