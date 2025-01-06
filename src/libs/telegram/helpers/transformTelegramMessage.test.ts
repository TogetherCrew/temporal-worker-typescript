import { transformTelegramMessage } from './transformTelegramMessage'; // Adjust path as needed
import { Chat, Message, User } from 'grammy/types';

describe('transformTelegramMessage', () => {
  const mockChat: Chat = { id: 1, type: 'private', first_name: '' }
  const mockUser: User = { id: 1, is_bot: false, first_name: 'User' }
  const mockReplyTo: Message = { chat: mockChat, date: 1234, message_id: 1234 }

  it('should remove the "from", "chat", and "reply_to_message" fields', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      from: mockUser,
      chat: mockChat,
      text: 'Test message'
    };

    const result = transformTelegramMessage(message);

    // Assert that the "from", "chat", and "reply_to_message" are removed
    expect(result.from).toBeUndefined();
    expect(result.chat).toBeUndefined();
    expect(result.reply_to_message).toBeUndefined();
  });

  it('should correctly stringify optional fields that are not null or undefined', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      text: 'Test message',
      entities: [{ offset: 0, length: 4, type: 'bold' }],
      chat: mockChat
    };

    const result = transformTelegramMessage(message);

    // Assert that 'entities' is stringified
    expect(result.entities).toBeDefined();
    expect(result.entities).toBe(JSON.stringify(message.entities));
  });

  it('should not stringify optional fields that are null or undefined', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      text: 'Test message',
      entities: null,
      poll: undefined,
      chat: mockChat
    };

    const result = transformTelegramMessage(message);

    // Assert that 'entities' is null and 'poll' is undefined
    expect(result.entities).toBeNull();
    expect(result.poll).toBeUndefined();
  });

  it('should stringify all optional fields when they are present', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      text: 'Test message',
      entities: [{ offset: 0, length: 4, type: 'bold' }],
      photo: [{
        file_id: 'photo123', width: 100, height: 100,
        file_unique_id: ''
      }],
      location: { latitude: 12.34, longitude: 56.78 },
      chat: mockChat
    };

    const result = transformTelegramMessage(message);

    // Assert that optional fields are stringified
    expect(result.entities).toBe(JSON.stringify(message.entities));
    expect(result.photo).toBe(JSON.stringify(message.photo));
    expect(result.location).toBe(JSON.stringify(message.location));
  });

  it('should not mutate the original message object', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      text: 'Test message',
      entities: [{ offset: 0, length: 4, type: 'bold' }],
      chat: mockChat
    };

    const messageCopy = { ...message }; // Create a copy of the original message
    const result = transformTelegramMessage(message);

    // Ensure that the original message object is not mutated
    expect(message).toEqual(messageCopy);
    expect(result).not.toBe(message); // Ensure result is a new object
  });

  it('should handle empty messages without throwing errors', () => {
    const message: Message = {
      message_id: 123,
      date: 1635230150,
      text: 'Test message',
      chat: mockChat
    };

    const result = transformTelegramMessage(message);

    // Check that no fields are missing or mutated unexpectedly
    expect(result).toHaveProperty('message_id', 123);
    expect(result).toHaveProperty('date', 1635230150);
    expect(result).toHaveProperty('text', 'Test message');
  });
})
