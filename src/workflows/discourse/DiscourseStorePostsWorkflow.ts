import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
const MAX_PARTITIONS = 1000;

const { storePostsInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 3
  }
});

type IDiscourseStorePostsWorkflow = {
  endpoint: string;
  formattedDate: string
};

export async function DiscourseStorePostsWorkflow({
  endpoint,
  formattedDate
}: IDiscourseStorePostsWorkflow) {
  console.log('Starting DiscourseStorePostsWorkflow');

  const limit = pLimit(100);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => storePostsInNeo4j(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  console.log('Finished DiscourseStorePostsWorkflow');
}
