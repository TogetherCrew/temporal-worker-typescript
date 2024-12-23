import { Update } from 'grammy/types';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';
import {
  chatDecorator,
  chatMemberUpdatedDecorator,
  mentionsDecorator,
  messageDecorator,
  reactionDecorator,
  userDecorator,
} from '../../libs/telegram/decorators';
import {
  chatMemberController,
  editedMessageController,
  messageController,
  messageReactionController,
} from '../../libs/telegram/controllers';

export async function storeEventToNeo4j(event: TelegramEvent, update: Update) {
  const chat = chatDecorator(update);
  const user = userDecorator(update);
  const message = messageDecorator(update);
  const mentions = mentionsDecorator(update);
  const chat_member = chatMemberUpdatedDecorator(update);
  const reaction = reactionDecorator(update);

  switch (event) {
    case TelegramEvent.MESSAGE:
      await messageController.event(chat, user, message, mentions);
      break;
    case TelegramEvent.EDITED_MESSAGE:
      await editedMessageController.event(chat, user, message, mentions);
      break;
    case TelegramEvent.MESSAGE_REACTION:
      await messageReactionController.event(chat, user, reaction);
      break;
    case TelegramEvent.CHAT_MEMBER:
      chatMemberController.event(chat, chat_member);
      break;
    default:
      throw new Error(`Unsupported event: ${event}`);
  }
}
