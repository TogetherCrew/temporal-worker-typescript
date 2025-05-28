import { executeChild, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { Context } from 'grammy';
import logger from '../../config/logger.config';

const { getCommunityFromTelegram, getPlatform } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1h',
  retry: {
    maximumAttempts: 3,
  },
});

type ITelegramSummaryWorkflow = {
  ctx: Context;
};

export async function TelegramSummaryWorkflow({
  ctx,
}: ITelegramSummaryWorkflow) {
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

  const platform = await getPlatform({
    name: 'telegram',
    'metadata.chat.id': chatId,
    'metadata.token': { $ne: null },
    'metadata.disconnectedAt': null,
  });

  if (!platform) {
    logger.error('No platform found');
    return;
  }

  let timePeriod = '';
  const text = ctx.update.message.text;
  if (text) {
    // Extract time period from command
    const timePeriodMatch = text.match(/^\/summary\s*(.*)$/);

    if (timePeriodMatch && timePeriodMatch[1]) {
      const input = timePeriodMatch[1].trim();

      // Check if input matches date format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        timePeriod = input;
      }
      // Check if input matches time period format (e.g. 1h, 4h)
      else if (/^\d+h$/.test(input)) {
        timePeriod = input;
      }
    }
  }

  const result = await executeChild('RealTimeSummaryWorkflow', {
    taskQueue: 'TEMPORAL_QUEUE_PYTHON_HEAVY',
    args: [
      {
        period: timePeriod,
        community_id: (community as any).id,
        platform_id: (platform as any).id,
      },
    ],
    workflowId: `rt-summary:telegram:${ctx.update.update_id}`,
  });

  return result;
}
