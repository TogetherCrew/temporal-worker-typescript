import pLimit from 'p-limit';

import { proxyActivities } from '@temporalio/workflow';

import type * as activities from '../../activities';

const MAX_PARTITIONS = 1000;

const { fetchActionsToS3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '60m',
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
  const limit = pLimit(1000);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => fetchActionsToS3(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);
}
