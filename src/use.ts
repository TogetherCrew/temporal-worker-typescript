// src/dev/sendChannelDelete.ts
import { Connection, Client } from '@temporalio/client';
import {
  eventIngest,
  EventIngestInput,
} from './workflows/discord/EventIngestionWorkflow'; // <- adjust path if needed

async function main() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({ connection });

  const input = {
    kind: 'channelDelete' as const,
    guildId: '980858613587382322',
    payload: { channelId: '980858613587382323' },
  } as EventIngestInput;

  const handle = await client.workflow.start(eventIngest, {
    taskQueue: 'TEMPORAL_QUEUE_HEAVY',
    workflowId: `demo:channelDelete:${Date.now()}`,
    args: [input],
  });

  console.log(`Started workflow ${handle.workflowId}`);
  await handle.result();
  console.log('Workflow completed ✅');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
