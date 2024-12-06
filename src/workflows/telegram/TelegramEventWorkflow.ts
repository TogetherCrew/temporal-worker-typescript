import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';
import { Update } from 'grammy/types';

interface ITelegramEventWorkflow {
  event: TelegramEvent;
  update: Update
}

const { storeEventToS3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramEventWorkflow({
  event, update
}: ITelegramEventWorkflow) {
  await storeEventToS3(event, update)
}
