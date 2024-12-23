import { Chat, User } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { JOINED_COUNT, CREATE_JOINED } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { joinedService } from './joined.service';

jest.mock('../../../libs/neo4j/Neo4jClient');

describe('JoinedService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'group',
    title: 'Test Group',
  };

  const mockUser: User = {
    id: 54321,
    is_bot: false,
    first_name: 'John',
    username: 'john_doe',
  };

  const mockTransaction = {
    run: jest.fn(),
  } as unknown as Transaction;

  const mockQueryResult = {
    records: [
      {
        get: jest.fn().mockReturnValue(1),
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('count', () => {
    it('should call tx.run when a transaction is provided', async () => {
      (mockTransaction.run as jest.Mock).mockResolvedValue(mockQueryResult);

      const count = await joinedService.count(
        mockChat,
        mockUser,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(JOINED_COUNT, {
        chat: mockChat,
        user: mockUser,
      });
      expect(count).toBe(1);
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      (neo4jService.run as jest.Mock).mockResolvedValue(mockQueryResult);

      const count = await joinedService.count(mockChat, mockUser);

      expect(neo4jService.run).toHaveBeenCalledWith(JOINED_COUNT, {
        chat: mockChat,
        user: mockUser,
      });
      expect(count).toBe(1);
    });
  });

  describe('create', () => {
    it('should call tx.run when a transaction is provided', async () => {
      await joinedService.create(
        mockChat,
        mockUser,
        1234567890,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_JOINED, {
        chat: mockChat,
        user: mockUser,
        date: 1234567890,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await joinedService.create(mockChat, mockUser, 1234567890);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_JOINED, {
        chat: mockChat,
        user: mockUser,
        date: 1234567890,
      });
    });

    it('should use the default date value when none is provided', async () => {
      await joinedService.create(mockChat, mockUser);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_JOINED, {
        chat: mockChat,
        user: mockUser,
        date: 0,
      });
    });
  });
});
