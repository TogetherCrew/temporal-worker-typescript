import { Chat, Message, MessageEntity } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_MENTIONED } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { mentionedService } from './mentioned.service';

jest.mock('../../../libs/neo4j/Neo4jClient');

describe('MentionedService', () => {
  const mockChat: Chat = {
    id: 12345,
    type: 'group',
    title: 'Test Group',
  };

  const mockMessage: Message = {
    message_id: 6789,
    date: Math.floor(Date.now() / 1000),
    chat: mockChat,
    text: 'Hello @user1 and @user2!',
    entities: [
      { offset: 6, length: 6, type: 'blockquote' },
      { offset: 6, length: 6, type: 'mention' },
      { offset: 6, length: 6, type: 'bold' },
      { offset: 17, length: 6, type: 'mention' },
      { offset: 6, length: 6, type: 'cashtag' },
    ],
  };

  const mockMentions: MessageEntity[] = [
    { offset: 6, length: 6, type: 'mention' },
    { offset: 17, length: 6, type: 'mention' },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await mentionedService.create(
        mockChat,
        mockMessage,
        mockMentions,
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_MENTIONED, {
        chat: mockChat,
        message: mockMessage,
        mentions: mockMentions,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await mentionedService.create(mockChat, mockMessage, mockMentions);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_MENTIONED, {
        chat: mockChat,
        message: mockMessage,
        mentions: mockMentions,
      });
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await mentionedService.create(
        mockChat,
        mockMessage,
        mockMentions,
        mockTransaction,
      );

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });
});
