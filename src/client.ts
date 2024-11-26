import { Connection, Client } from '@temporalio/client';
import { DiscourseExtractWorkflow } from './workflows';
import { QUEUE } from './shared/queues';

const endpoints = [
  'community.singularitynet.io',
  // 'gov.optimism.io',
  // 'research.arbitrum.io',
  // 'forum.arbitrum.foundation'
]


async function start(client: Client, endpoint: string) {
  const handle = await client.workflow.start(DiscourseExtractWorkflow, {
    taskQueue: QUEUE.HEAVY,
    args: [
      {
        endpoint,
        platformId: '1234-abcd',
        options: undefined,
      },
    ],
    workflowId: `discourse/${endpoint}`,
  });
  console.log(`Started workflow ${handle.workflowId}`);
}


async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
  });

  for (const endpoint of endpoints) {
    await start(client, endpoint)
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
