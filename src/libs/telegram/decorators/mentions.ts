import { MessageEntity, Update } from 'grammy/types';

export function mentionsDecorator(update: Update): MessageEntity[] {
  try {
    const message = update.message || update.edited_message;

    const mentions = message.entities?.filter(
      (entity) => entity.type === 'mention',
    );

    const usernames = [];
    if (mentions) {
      for (const mention of mentions) {
        usernames.push(
          message.text.slice(
            mention.offset + 1,
            mention.offset + mention.length,
          ),
        );
      }
    }
    return usernames;
  } catch (error) {
    return [];
  }
}
