import { Update } from 'grammy/types';

export async function getMentions(update: Update): Promise<string[]> {
  const entities =
    update.message?.entities || update.message?.caption_entities || [];
  const text = update.message?.text || update.message?.caption || '';

  const mentions: string[] = [];

  for (const entity of entities) {
    if (entity.type === 'mention' || entity.type === 'text_mention') {
      const mentionText = text.slice(
        entity.offset,
        entity.offset + entity.length,
      );
      // Remove leading "@" if present
      const cleaned = mentionText.replace(/^@/, '');
      mentions.push(cleaned);
    }
  }

  return mentions;
}
