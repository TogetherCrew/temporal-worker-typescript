import { Chat, Update, User } from 'grammy/types';
import { userDecorator } from './user'; // Adjust the path as needed

describe('userDecorator', () => {
  const mockChat: Chat = { id: 1, type: 'private', first_name: '' };
  const mockUser: User = { id: 1, is_bot: false, first_name: 'User' };

  it('should return the user from a message', () => {
    const update: Update = {
      message: {
        from: mockUser,
        message_id: 0,
        date: 0,
        chat: mockChat,
      },
      update_id: 0,
    };

    const user = userDecorator(update);
    expect(user).toEqual(mockUser);
  });

  it('should return the user from an edited message', () => {
    const update: Update = {
      edited_message: {
        from: mockUser,
        message_id: 0,
        date: 0,
        chat: mockChat,
        edit_date: 0,
      },
      update_id: 0,
    };

    const user = userDecorator(update);
    expect(user).toEqual(mockUser);
  });

  it('should return the user from a message reaction', () => {
    const update: Update = {
      message_reaction: {
        user: mockUser,
        new_reaction: [{ type: 'emoji', emoji: '🎉' }],
        old_reaction: [],
        chat: mockChat,
        message_id: 0,
        date: 0,
      },
      update_id: 0,
    };

    const user = userDecorator(update);
    expect(user).toEqual(mockUser);
  });

  it('should return the user from a chat member update', () => {
    const update: Update = {
      chat_member: {
        new_chat_member: {
          user: mockUser,
          status: 'member',
        },
        from: mockUser,
        chat: mockChat,
        date: 0,
        old_chat_member: undefined,
      },
      update_id: 0,
    };

    const user = userDecorator(update);
    expect(user).toEqual(mockUser);
  });

  it('should return undefined if no user is present', () => {
    const update: Update = {
      update_id: 0,
    };

    const user = userDecorator(update);
    expect(user).toBeUndefined();
  });
});
