import { proxyActivities, startChild } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { TelegramEvent } from '../../shared/types/telegram/TelegramEvent';
import { Update } from 'grammy/types';

interface ITelegramEventWorkflow {
  event: TelegramEvent;
  update: Update;
}

const { storeEventToS3, storeEventToNeo4j, migrateChat } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function TelegramEventWorkflow({
  event,
  update,
}: ITelegramEventWorkflow) {
  await storeEventToS3(event, update);
  await storeEventToNeo4j(event, update);

  if (event === TelegramEvent.MIGRATE_TO_CHAT_ID) {
    await migrateChat(
      update.message.chat.id,
      update.message.migrate_to_chat_id,
    );
  }

  await startChild('TelegramVectorIngestionWorkflow', {
    taskQueue: 'TEMPORAL_QUEUE_HEAVY',
    args: [event, update],
    workflowId: `telegram:vector-ingestion:${update.update_id}`,
  });
}
