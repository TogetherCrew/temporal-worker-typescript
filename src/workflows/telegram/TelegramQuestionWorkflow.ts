import { executeChild, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { Context } from 'grammy';
import logger from '../../config/logger.config';

const { getCommunityFromTelegram } = proxyActivities<typeof activities>({
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
  const chatId = ctx.update.message.chat.id;
  if (!chatId) {
    logger.error('No chat ID found');
    return;
  }
  const community = await getCommunityFromTelegram(chatId);
  if (!community) {
    logger.error('No community found');
    return;
  }

  const text = ctx.update.message.text;
  if (!text) {
    logger.error('No text found');
    return;
  }

  const result = await executeChild('AgenticHivemindTemporalWorkflow', {
    taskQueue: 'HIVEMIND_AGENT_QUEUE',
    args: [
      {
        community_id: (community as any).id,
        query: text,
        enable_answer_skipping: true,
      },
    ],
    workflowId: `telegram:hivemind:${ctx.update.update_id}`,
  });

  return result;
}
