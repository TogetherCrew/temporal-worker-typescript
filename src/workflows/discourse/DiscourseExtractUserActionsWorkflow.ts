import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
const MAX_PARTITIONS = 1000;

const { fetchActionsToS3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseExtractUserActionsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractUserActionsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractUserActionsWorkflow) {
  console.log('Starting DiscourseExtractUserActionsWorkflow', { endpoint });

  const limit = pLimit(100);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => fetchActionsToS3(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  console.log('Finished DiscourseExtractUserActionsWorkflow', { endpoint });
}
