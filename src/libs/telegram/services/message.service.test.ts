import { Chat, User, Message } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_MESSAGE, UPDATE_MESSAGE } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { transformTelegramMessage } from '../helpers/transformTelegramMessage';
import { messageService } from './message.service';

jest.mock('../../../libs/neo4j/Neo4jClient');
jest.mock('../helpers/transformTelegramMessage');

describe('MessageService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'private',
    first_name: 'mock chat',
  };

  const mockUser: User = {
    id: 67890,
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    is_bot: false,
  };

  const mockMessage: Message = {
    message_id: 1,
    date: 1631212232,
    chat: mockChat,
    text: 'Hello, World!',
  };

  const transformedMessage = { id: 1, text: 'Transformed Hello, World!' };

  beforeEach(() => {
    (transformTelegramMessage as jest.Mock).mockReturnValue(transformedMessage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageService.create(
        mockChat,
        mockUser,
        mockMessage,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_MESSAGE, {
        chat: mockChat,
        user: mockUser,
        message: transformedMessage,
      });
      expect(transformTelegramMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await messageService.create(mockChat, mockUser, mockMessage);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_MESSAGE, {
        chat: mockChat,
        user: mockUser,
        message: transformedMessage,
      });
      expect(transformTelegramMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageService.create(
        mockChat,
        mockUser,
        mockMessage,
        mockTransaction,
      );

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageService.update(
        mockChat,
        mockUser,
        mockMessage,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(UPDATE_MESSAGE, {
        chat: mockChat,
        user: mockUser,
        message: transformedMessage,
      });
      expect(transformTelegramMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await messageService.update(mockChat, mockUser, mockMessage);

      expect(neo4jService.run).toHaveBeenCalledWith(UPDATE_MESSAGE, {
        chat: mockChat,
        user: mockUser,
        message: transformedMessage,
      });
      expect(transformTelegramMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageService.update(
        mockChat,
        mockUser,
        mockMessage,
        mockTransaction,
      );

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });
});
