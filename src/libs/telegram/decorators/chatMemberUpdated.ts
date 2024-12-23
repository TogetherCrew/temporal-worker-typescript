import { ChatMemberUpdated, Update } from 'grammy/types';

export function chatMemberUpdatedDecorator(update: Update): ChatMemberUpdated {
  return update.chat_member;
}
