import { keyManager } from '../../libs/telegram/TelegramKeyManager';
import { s3 } from '../../libs/s3/S3Gzip';
import { Chat, Update } from 'grammy/types';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';

export async function storeEventToS3(event: TelegramEvent, update: Update) {
  let date: number, chat: Chat, update_id: number;
  switch (event) {
    case TelegramEvent.MESSAGE:
      ({
        message: { date, chat },
        update_id,
      } = update);
      await storeEvent(date, chat.id, update_id, event, update);
      break;
    case TelegramEvent.EDITED_MESSAGE:
      ({
        edited_message: { date, chat },
        update_id,
      } = update);
      break;
    case TelegramEvent.MESSAGE_REACTION:
      ({
        message_reaction: { date, chat },
        update_id,
      } = update);
      break;
    case TelegramEvent.CHAT_MEMBER:
      ({
        chat_member: { date, chat },
        update_id,
      } = update);
      break;
    default:
      throw new Error(`Unsupported event: ${event}`);
  }
  await storeEvent(date, chat.id, update_id, event, update);
}

async function storeEvent(
  timestamp: number,
  chat_id: number,
  update_id: number,
  type: string,
  update: Update,
) {
  const key = keyManager.getKey(timestamp, chat_id, update_id, type);
  await s3.put(key, update);
}
