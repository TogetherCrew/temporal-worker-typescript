import pLimit from 'p-limit';

import { proxyActivities } from '@temporalio/workflow';

import type * as activities from '../../activities';

const MAX_PARTITIONS = 1000;

const { storeTopicsInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseStoreTopicsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseStoreTopicsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseStoreTopicsWorkflow) {
  const limit = pLimit(100);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => storeTopicsInNeo4j(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);
}
