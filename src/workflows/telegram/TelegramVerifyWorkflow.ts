import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';

interface ITelegramVerifyWorkflow {
  token: string;
  chat: object;
  from: object;
}

const { verifyTelegram } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramVerifyWorkflow({
  token,
  chat,
  from,
}: ITelegramVerifyWorkflow): Promise<string> {
  const result = await verifyTelegram(token, chat, from);
  return result;
}
