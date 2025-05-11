import { Connection, Client } from '@temporalio/client';
import { QUEUE } from '../../shared/queues';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'telegram:verify' });
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
  logger.info(`Started workflow ${handle.workflowId}`);

  const result = await handle.result();

  logger.info(`Result: ${result}`);
}

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
