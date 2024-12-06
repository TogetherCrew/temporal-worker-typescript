import { Chat, User, MessageReactionUpdated } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_REACTION } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { messageReactionService } from './message_reaction.service';

jest.mock('../../../libs/neo4j/Neo4jClient');

describe('MessageReactionService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'private',
    first_name: 'mock chat',
  };

  const mockUser: User = {
    id: 67890,
    first_name: 'Jane',
    username: 'janedoe',
    is_bot: false,
  };

  const mockReaction: MessageReactionUpdated = {
    message_id: 42,
    date: 1234,
    chat: mockChat,
    user: mockUser,
    actor_chat: mockChat,
    old_reaction: [{ type: 'emoji', emoji: '👍' }],
    new_reaction: [{ type: 'emoji', emoji: '👎' }],
  };

  const transformedReaction = {
    message_id: mockReaction.message_id,
    date: mockReaction.date,
    old_reaction: JSON.stringify(mockReaction.old_reaction),
    new_reaction: JSON.stringify(mockReaction.new_reaction),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageReactionService.create(
        mockChat,
        mockUser,
        mockReaction,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_REACTION, {
        chat: mockChat,
        user: mockUser,
        reaction: transformedReaction,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await messageReactionService.create(mockChat, mockUser, mockReaction);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_REACTION, {
        chat: mockChat,
        user: mockUser,
        reaction: transformedReaction,
      });
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await messageReactionService.create(
        mockChat,
        mockUser,
        mockReaction,
        mockTransaction,
      );

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });

  describe('transformReaction', () => {
    it('should transform the reaction object correctly', () => {
      const privateMethod = messageReactionService['transformReaction'].bind(
        messageReactionService,
      );
      const result = privateMethod(mockReaction);

      expect(result).toEqual(transformedReaction);
    });
  });
});
