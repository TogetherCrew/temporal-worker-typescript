import { Message, Update } from 'grammy/types';

export function messageDecorator(update: Update): Message {
  return update.message || update.edited_message;
}
