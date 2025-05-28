import { Update } from 'grammy/types';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';
import { getMentions } from './getMentions';

interface Community {
  id: string;
}

interface Platform {
  id: string;
}

interface VectorIngestionPayload {
  community_id: string;
  platform_id: string;
  text: string;
  doc_id: number;
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    mentions: string[];
    replies: string[];
    reactors: string[];
    chat_name: string;
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
  'chat_name',
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
    community_id: community.id,
    platform_id: platform.id,
    text: update.message.text,
    doc_id: update.message.message_id,
    metadata: {
      author: update.message.from.first_name,
      createdAt: new Date(messageDate * 1000).toISOString(),
      updatedAt: new Date(editDate * 1000).toISOString(),
      mentions,
      replies: [],
      reactors: [],
      chat_name: update.message.chat.title,
      url: `https://t.me/${update.message.chat.id}/${update.message.message_id}`,
    },
    excludedEmbedMetadataKeys: [...EXCLUDED_METADATA_KEYS],
    excludedLlmMetadataKeys: EXCLUDED_METADATA_KEYS.filter(
      (key) => key !== 'author',
    ),
  };
}
