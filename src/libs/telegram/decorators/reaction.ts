import { MessageReactionUpdated, Update } from 'grammy/types';

export function reactionDecorator(update: Update): MessageReactionUpdated {
  return update.message_reaction;
}
