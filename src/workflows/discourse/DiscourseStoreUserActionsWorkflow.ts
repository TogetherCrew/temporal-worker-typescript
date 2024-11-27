import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
const MAX_PARTITIONS = 1000;

const { storeActionsInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseStoreUserActionsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseStoreUserActionsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseStoreUserActionsWorkflow) {
  console.log('Starting DiscourseStoreUserActionsWorkflow');

  const limit = pLimit(1);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => storeActionsInNeo4j(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  console.log('Finished DiscourseStoreUserActionsWorkflow');
}
