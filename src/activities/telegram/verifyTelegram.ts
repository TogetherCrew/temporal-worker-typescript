import {
  IToken,
  Platform,
  PlatformNames,
  Token,
  TokenTypeNames,
} from '@togethercrew.dev/db';
import { FilterQuery } from 'mongoose';

export async function verifyTelegram(
  tokenStr: string,
  chat: object,
  from: object,
): Promise<string> {
  // const session = await mongoose.startSession();

  try {
    // session.startTransaction();

    const filter: FilterQuery<IToken> = {
      token: tokenStr,
      type: TokenTypeNames.TELEGRAM_VERIFICATION,
      blacklisted: false,
    };

    const update = {
      $set: {
        blacklisted: true,
      },
    };

    const options = { new: true, upsert: false };

    const token = await Token.findOneAndUpdate(filter, update, {
      ...options,
      // session,
    });

    if (!token) {
      // await session.abortTransaction();
      return "Failed. Token doesn't exist.";
    } else {
      await Platform.create(
        {
          name: PlatformNames.Telegram,
          community: token.community,
          connectedAt: new Date(),
          'metadata.chat': chat,
          'metadata.from': from,
          'metadata.token': tokenStr,
        },
        // { session },
      );
    }

    // await session.commitTransaction();
    return 'Verification successful. Platform created.';
  } catch (error) {
    console.error(error);
    // await session.abortTransaction();
    return `Failed. Could not complete action.`;
  } finally {
    // session.endSession();
  }
}
