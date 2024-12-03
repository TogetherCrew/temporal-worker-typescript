import { Platform, PlatformNames } from '@togethercrew.dev/db';
import { Document } from 'mongoose';

async function setVerified(platform: Document, chat: object, from: object) {
  try {
    platform.set('metadata.token.verifiedAt', new Date());
    platform.set('metadata.chat', chat);
    platform.set('metadata.from', from);
    await platform.save();
  } catch (error) {
    console.error('Error updating platform', error);
    throw error;
  }
}

export async function verifyTelegram(
  token: string,
  chat: object,
  from: object,
): Promise<string> {
  const filters = {
    name: PlatformNames.Telegram,
    'metadata.token.value': token,
    'metadata.token.verifiedAt': { $exists: false },
  };

  console.log('Find with filters', filters);
  const platforms = await Platform.find(filters);
  console.log('Result', platforms);

  if (platforms.length === 1) {
    const platform = platforms.pop();
    await setVerified(platform, chat, from);
    return 'Success! Platform verified.';
  } else {
    return `Failed. Platform not found.`;
  }
}
