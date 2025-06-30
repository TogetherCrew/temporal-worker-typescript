import { Update } from 'grammy/types';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';

function remove100FromChatId(text: number) {
  const textStr = text.toString();
  if (textStr.startsWith('-100')) {
    return textStr.slice(4);
  }
  return textStr;
}

interface Community {
  id: string;
}

interface Platform {
  id: string;
}

interface VectorIngestionPayload {
  communityId: string;
  platformId: string;
  text: string;
  docId: string;
  metadata: {
    author: string;
    createdAt: number;
    updatedAt: number;
    mentions: string[];
    replies: string[];
    reactors: string[];
    chatName: string;
    url: string;
  };
  excludedEmbedMetadataKeys: string[];
  excludedLlmMetadataKeys: string[];
}

const EXCLUDED_METADATA_KEYS = [
  'author',
  'createdAt',
  'updatedAt',
  'mentions',
  'replies',
  'reactors',
  'chatName',
  'url',
] as const;

export async function generateVectorIngestionPayload(
  community: Community,
  platform: Platform,
  update: Update,
  event: TelegramEvent,
  mentions: string[],
): Promise<VectorIngestionPayload> {
  const messageDate = update.message.date;
  const editDate =
    event === TelegramEvent.EDITED_MESSAGE
      ? update.edited_message?.edit_date
      : messageDate;

  return {
    communityId: community.id,
    platformId: platform.id,
    text: update.message.text || update.edited_message.text,
    docId: update.message.message_id.toString() || update.edited_message.message_id.toString(),
    metadata: {
      author: update.message.from.first_name,
      createdAt: messageDate,
      updatedAt: editDate,
      mentions,
      replies: [],
      reactors: [],
      chatName: update.message.chat.title || update.edited_message.chat.title,
      url: `https://t.me/c/${remove100FromChatId(update.message.chat.id || update.edited_message.chat.id)}/${update.message.message_id || update.edited_message.message_id}`,
    },
    excludedEmbedMetadataKeys: [...EXCLUDED_METADATA_KEYS],
    excludedLlmMetadataKeys: EXCLUDED_METADATA_KEYS.filter(
      (key) => key !== 'author',
    ),
  };
}
