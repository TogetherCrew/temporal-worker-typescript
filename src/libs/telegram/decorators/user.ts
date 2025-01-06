import { Update, User } from 'grammy/types';

export function userDecorator(update: Update): User {
  return (
    update.message?.from ||
    update.edited_message?.from ||
    update.message_reaction?.user ||
    update.chat_member?.new_chat_member.user
  );
}
