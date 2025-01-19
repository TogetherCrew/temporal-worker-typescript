import { Context } from 'grammy';
import { HivemindQuestion } from '../../shared/types/hivemind/HivemindQuestion';
import { Platform, PlatformNames } from '@togethercrew.dev/db';
import { Queue } from '@togethercrew.dev/tc-messagebroker';

export async function adaptForHivemind(
  ctx: Context,
): Promise<HivemindQuestion> {
  const chatId = ctx.update.message.chat.id;
  const platform = await Platform.findOne({
    'metadata.id': chatId,
  });

  const message = ctx.update.message.text;

  return {
    communityId: platform.community,
    route: {
      source: PlatformNames.Telegram,
      destination: {
        queue: Queue.TELEGRAM,
        event: 'SEND_MESSAGE',
      },
    },
    question: {
      message,
    },
    metadata: {
      ctx,
      enableAnswerSkipping: true,
    },
  };
}
