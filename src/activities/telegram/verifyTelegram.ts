import { Platform, PlatformNames } from '@togethercrew.dev/db';

export async function verifyTelegram(
  token: string,
  chat: object,
  from: object,
): Promise<string> {
  const filter = {
    name: PlatformNames.Telegram,
    'metadata.token.value': token,
    'metadata.token.verifiedAt': { $exists: false },
  };

  const update = {
    $set: {
      'metadata.token.verifiedAt': new Date(),
      'metadata.chat': chat,
      'metadata.from': from,
    },
  };
  const options = { new: true, upsert: false };

  const platform = await Platform.findOneAndUpdate(filter, update, options);

  if (platform) {
    return 'Success! Platform verified.';
  } else {
    return `Failed. Platform not found.`;
  }
}
