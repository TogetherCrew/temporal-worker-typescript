import { Chat, Message } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { neo4jService } from '../../neo4j/Neo4jClient';
import { CREATE_REPLIED } from '../neo4j/cyphers';
import { repliedService } from './replied.service';

jest.mock('../../neo4j/Neo4jClient');

describe('RepliedService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'private',
    first_name: 'Mock Chat',
  };

  const mockMessage: Message = {
    message_id: 1,
    date: 1631212232,
    chat: mockChat,
    text: 'Hello, World!',
  };

  const mockReplyToMessage: Message = {
    message_id: 2,
    date: 1631212230,
    chat: mockChat,
    text: 'Hi there!',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await repliedService.create(
        mockChat,
        mockMessage,
        mockReplyToMessage,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_REPLIED, {
        chat: mockChat,
        message: mockMessage,
        reply_to_message: mockReplyToMessage,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await repliedService.create(mockChat, mockMessage, mockReplyToMessage);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_REPLIED, {
        chat: mockChat,
        message: mockMessage,
        reply_to_message: mockReplyToMessage,
      });
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await repliedService.create(
        mockChat,
        mockMessage,
        mockReplyToMessage,
        mockTransaction,
      );

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });
});
