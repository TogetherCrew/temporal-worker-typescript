import { Chat, Update } from 'grammy/types';

export function chatDecorator(update: Update): Chat {
  return (
    update.message?.chat ||
    update.edited_message?.chat ||
    update.message_reaction?.chat ||
    update.chat_member?.chat
  );
}
