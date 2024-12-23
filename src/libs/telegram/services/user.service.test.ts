import { User } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { CREATE_OR_UPDATE_USER } from '../neo4j/cyphers';
import { userService } from './user.service';

jest.mock('../../../libs/neo4j/Neo4jClient');

describe('UserService', () => {
  const mockUser: User = {
    id: 123,
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    is_bot: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdate', () => {
    it('should call tx.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await userService.createOrUpdate(mockUser, mockTransaction);

      expect(mockTransaction.run).toHaveBeenCalledWith(CREATE_OR_UPDATE_USER, {
        user: mockUser,
      });
    });

    it('should call neo4jService.run when no transaction is provided', async () => {
      await userService.createOrUpdate(mockUser);

      expect(neo4jService.run).toHaveBeenCalledWith(CREATE_OR_UPDATE_USER, {
        user: mockUser,
      });
    });

    it('should not call neo4jService.run when a transaction is provided', async () => {
      const mockTransaction = {
        run: jest.fn(),
      } as unknown as Transaction;

      await userService.createOrUpdate(mockUser, mockTransaction);

      expect(neo4jService.run).not.toHaveBeenCalled();
    });
  });
});
