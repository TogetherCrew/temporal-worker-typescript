import { Connection, Client } from '@temporalio/client';
import { QUEUE } from '../../shared/queues';

const token = 'A1B2C3';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
  });

  const handle = await client.workflow.start('TelegramVerifyWorkflow', {
    taskQueue: QUEUE.LIGHT,
    args: [
      {
        token,
        chat: { id: '1234' },
        from: { id: '4321' },
      },
    ],
    workflowId: `telegram:verify:${token}`,
  });
  console.log(`Started workflow ${handle.workflowId}`);

  const result = await handle.result();

  console.log(`Result: ${result}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
