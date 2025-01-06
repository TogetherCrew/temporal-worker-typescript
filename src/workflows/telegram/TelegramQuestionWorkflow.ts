import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { Context } from 'grammy';

const { isQuestion, adaptForHivemind, ask } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1h',
  retry: {
    maximumAttempts: 3,
  },
});

type ITelegramQuestionWorkflow = {
  ctx: Context;
};

export async function TelegramQuestionWorkflow({
  ctx,
}: ITelegramQuestionWorkflow) {
  const text = ctx.update.message.text;
  if (await isQuestion(text)) {
    const question = await adaptForHivemind(ctx);
    await ask(question);
  }
}
