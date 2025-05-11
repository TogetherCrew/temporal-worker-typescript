import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({
  module: 'DiscourseStoreCategoriesWorkflow',
});

const { storeCategoriesInNeo4j } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseStoreCategoriesWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseStoreCategoriesWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseStoreCategoriesWorkflow) {
  logger.info('Starting DiscourseStoreCategoriesWorkflow');
  await storeCategoriesInNeo4j(endpoint, formattedDate);
  logger.info('Finished DiscourseStoreCategoriesWorkflow');
}
