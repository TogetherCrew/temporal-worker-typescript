import { FilterQuery } from 'mongoose';

import {
  IToken,
  Platform,
  PlatformNames,
  Token,
  TokenTypeNames,
} from '@togethercrew.dev/db';

import {
  analyzerAction,
  analyzerWindow,
} from '../../shared/constants/analyzer.constant';

export async function verifyTelegram(
  tokenStr: string,
  chat: any,
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
      const existingPlatform = await Platform.findOne({
        name: PlatformNames.Telegram,
        'metadata.id': chat.id,
      });

      if (existingPlatform) {
        return 'This Telegram group has already been added by another admin.';
      }

      const now = new Date();
      const period = new Date();
      period.setDate(now.getDate() - 30);

      await Platform.create(
        {
          name: PlatformNames.Telegram,
          community: token.community,
          connectedAt: new Date(),
          'metadata.chat': chat,
          'metadata.from': from,
          'metadata.token': tokenStr,
          'metadata.id': chat.id,
          'metadata.action': analyzerAction,
          'metadata.window': analyzerWindow,
          'metadata.period': period,
        },
        // { session },
      );
    }

    // await session.commitTransaction();
    return 'Verification successful.\nPlatform added to your TogetherCrew community account.\nNew conversations will now be imported and analysed.';
  } catch (error) {
    console.error(error);
    // await session.abortTransaction();
    return `Failed. Could not complete action.`;
  } finally {
    // session.endSession();
  }
}
