import { Connection, Client } from '@temporalio/client';
import { DiscourseExtractWorkflow } from './workflows';
import { QUEUE } from './shared/queues';

const endpoint = 'community.singularitynet.io';
// const endpoint = 'gov.optimism.io';

async function run() {
  const connection = await Connection.connect({ address: 'temporal:7233' });

  const client = new Client({
    connection,
  });

  const handle = await client.workflow.start(DiscourseExtractWorkflow, {
    taskQueue: QUEUE.HEAVY,
    args: [endpoint, '1234-abcd'],
    workflowId: `discourse/${endpoint}`,
  });
  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  await handle.result();
  console.log(`Finished workflow ${handle.workflowId}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
