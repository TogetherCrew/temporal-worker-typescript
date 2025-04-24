import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { FilterQuery } from 'mongoose';
import { IPlatform } from '@togethercrew.dev/db';

interface ITelegramGetPlatformWorkflow {
  chatId: string | number;
}

const { getPlatform } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramGetPlatformWorkflow({
  chatId,
}: ITelegramGetPlatformWorkflow): Promise<object> {
  const filter: FilterQuery<IPlatform> = {
    name: 'telegram',
    'metadata.chat.id': chatId,
    'metadata.token': { $ne: null },
    'metadata.disconnectedAt': null,
  };
  return await getPlatform(filter);
}
