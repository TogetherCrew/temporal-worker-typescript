import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({
  module: 'DiscourseExtractUserActionsWorkflow',
});

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
  logger.info('Starting DiscourseExtractUserActionsWorkflow', { endpoint });

  const limit = pLimit(1000);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => fetchActionsToS3(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  logger.info('Finished DiscourseExtractUserActionsWorkflow', { endpoint });
}
