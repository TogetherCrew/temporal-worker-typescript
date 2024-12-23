import { Chat, User, Message } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_MESSAGE, UPDATE_MESSAGE } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { transformTelegramMessage } from '../helpers/transformTelegramMessage';

export class MessageService {
  async create(
    chat: Chat,
    user: User,
    message: Message,
    tx?: Transaction,
  ): Promise<void> {
    if (tx) {
      tx.run(CREATE_MESSAGE, {
        chat,
        user,
        message: transformTelegramMessage(message),
      });
    } else {
      neo4jService.run(CREATE_MESSAGE, {
        chat,
        user,
        message: transformTelegramMessage(message),
      });
    }
  }

  async update(
    chat: Chat,
    user: User,
    message: Message,
    tx?: Transaction,
  ): Promise<void> {
    if (tx) {
      tx.run(UPDATE_MESSAGE, {
        chat,
        user,
        message: transformTelegramMessage(message),
      });
    } else {
      neo4jService.run(UPDATE_MESSAGE, {
        chat,
        user,
        message: transformTelegramMessage(message),
      });
    }
  }
}

export const messageService = new MessageService();
