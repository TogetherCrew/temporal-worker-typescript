import { proxyActivities, startChild } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';
import { Update } from 'grammy/types';
import logger from '../../config/logger.config';

interface ITelegramVectorIngestionWorkflow {
  event: TelegramEvent;
  update: Update;
}

const {
  getCommunityFromTelegram,
  getPlatform,
  getMentions,
  generateVectorIngestionPayload,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramVectorIngestionWorkflow({
  event,
  update,
}: ITelegramVectorIngestionWorkflow) {
  if (
    !(event === TelegramEvent.EDITED_MESSAGE || event === TelegramEvent.MESSAGE)
  ) {
    logger.info('Skipping vector ingestion for event', {
      event,
      message_id: update.message.message_id,
    });
    return;
  }

  const chatId = update.message.chat.id;
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

  const mentions = await getMentions(update);
  const payload = await generateVectorIngestionPayload(
    community as any,
    platform as any,
    update,
    event,
    mentions,
  );

  const vectorIngestionWorkflow = await startChild('VectorIngestionWorkflow', {
    taskQueue: 'TEMPORAL_QUEUE_PYTHON_HEAVY',
    args: [payload],
    workflowId: `vector-ingestion:${update.update_id}`,
  });

  await vectorIngestionWorkflow.result();
}
