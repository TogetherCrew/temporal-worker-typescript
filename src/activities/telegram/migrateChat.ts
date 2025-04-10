import { Platform } from '@togethercrew.dev/db';
import { chatService } from '../../libs/telegram/services/chat.service';

export const migrateChat = async (
  oldChatId: string | number,
  newChatId: string | number,
) => {
  const filter = {
    name: 'telegram',
    'metadata.chat.id': oldChatId,
  };

  const update = {
    $set: {
      'metadata.chat.id': newChatId,
    },
  };

  await Platform.updateOne(filter, update);
  await chatService.migrateChat(oldChatId, newChatId);
};
