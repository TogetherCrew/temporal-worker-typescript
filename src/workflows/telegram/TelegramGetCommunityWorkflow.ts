import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';

interface ITelegramGetCommunityWorkflow {
  chatId: string | number;
}

const { getCommunityFromTelegram } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramGetCommunityWorkflow({
  chatId,
}: ITelegramGetCommunityWorkflow): Promise<object> {
  return await getCommunityFromTelegram(chatId);
}
