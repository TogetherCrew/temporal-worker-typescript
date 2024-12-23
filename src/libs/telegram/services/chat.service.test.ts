import { Chat } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_OR_UPDATE_CHAT } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from './chat.service';

jest.mock('../../../libs/neo4j/Neo4jClient');

describe('ChatService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'group',
    title: 'Test Group',
  };

  const mockTransaction = {
    run: jest.fn(),
  } as unknown as Transaction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdate', () => {
    it('should call tx.run when a transaction is provided', async () => {
      await chatService.createOrUpdate(mockChat, mockTransaction);

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_OR_UPDATE_CHAT, {
        chat: mockChat,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await chatService.createOrUpdate(mockChat);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_OR_UPDATE_CHAT, {
        chat: mockChat,
      });
    });
  });
});
