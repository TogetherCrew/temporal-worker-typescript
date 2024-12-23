import { Chat, User } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import {
  MEMBER_PROMOTED,
  MEMBER_DEMOTED,
  MEMBER_UNRESTRICTED,
  MEMBER_RESTRICTED,
  MEMBER_UNBANNED,
  MEMBER_JOINED,
  MEMBER_BANNED,
  MEMBER_LEFT,
} from '../neo4j/cyphers';
import { neo4jService } from '../../neo4j/Neo4jClient';
import { chatMemberService } from './chat_member.service';

jest.mock('../../neo4j/Neo4jClient');

describe('ChatMemberService', () => {
  const mockChat: Chat = { id: 12345, type: 'group', title: 'Test Chat' };
  const mockUser: User = { id: 67890, is_bot: false, first_name: 'Test User' };
  const mockFrom: User = { id: 11111, is_bot: false, first_name: 'Admin User' };
  const mockDate = Date.now();
  const mockTransaction = {
    run: jest.fn(),
  } as unknown as Transaction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('write', () => {
    it('should call tx.run when a transaction is provided', async () => {
      await chatMemberService['write'](
        MEMBER_PROMOTED,
        { chat: mockChat, user: mockUser, date: mockDate, from: mockFrom },
        mockTransaction,
      );

      expect(mockTransaction.run).toHaveBeenCalledWith(MEMBER_PROMOTED, {
        chat: mockChat,
        user: mockUser,
        date: mockDate,
        from: mockFrom,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await chatMemberService['write'](MEMBER_PROMOTED, {
        chat: mockChat,
        user: mockUser,
        date: mockDate,
        from: mockFrom,
      });

      expect(neo4jService.run).toHaveBeenCalledWith(MEMBER_PROMOTED, {
        chat: mockChat,
        user: mockUser,
        date: mockDate,
        from: mockFrom,
      });
    });
  });

  describe('specific methods', () => {
    const testCases = [
      { method: 'promoted', cypher: MEMBER_PROMOTED },
      { method: 'demoted', cypher: MEMBER_DEMOTED },
      { method: 'unrestricted', cypher: MEMBER_UNRESTRICTED },
      { method: 'restricted', cypher: MEMBER_RESTRICTED },
      { method: 'unbanned', cypher: MEMBER_UNBANNED },
      { method: 'joined', cypher: MEMBER_JOINED },
      { method: 'banned', cypher: MEMBER_BANNED },
      { method: 'left', cypher: MEMBER_LEFT },
    ];

    testCases.forEach(({ method, cypher }) => {
      it(`should call write with ${cypher} when ${method} is invoked`, async () => {
        const writeSpy = jest.spyOn(chatMemberService as any, 'write');
        await chatMemberService[method](
          mockChat,
          mockUser,
          mockDate,
          mockFrom,
          mockTransaction,
        );

        expect(writeSpy).toHaveBeenCalledWith(
          cypher,
          {
            chat: mockChat,
            user: mockUser,
            date: mockDate,
            from: mockFrom,
          },
          mockTransaction,
        );
      });
    });
  });
});
