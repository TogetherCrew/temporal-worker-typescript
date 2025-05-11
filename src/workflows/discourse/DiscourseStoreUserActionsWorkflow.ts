import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({
  module: 'DiscourseStoreUserActionsWorkflow',
});

const MAX_PARTITIONS = 1000;

const { storeActionsInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
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
  logger.info('Starting DiscourseStoreUserActionsWorkflow');

  const limit = pLimit(1);
  const promises = Array.from({ length: MAX_PARTITIONS }, (_, i) => i).map(
    (i) => limit(() => storeActionsInNeo4j(endpoint, formattedDate, i)),
  );

  await Promise.all(promises);

  logger.info('Finished DiscourseStoreUserActionsWorkflow');
}
