import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
const MAX_PARTITIONS = 1000;

const { storeUsersInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseStoreUsersWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseStoreUsersWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseStoreUsersWorkflow) {
  console.log('Starting DiscourseStoreUsersWorkflow');

  const limit = pLimit(100);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => storeUsersInNeo4j(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  console.log('Finished DiscourseStoreUsersWorkflow');
}
