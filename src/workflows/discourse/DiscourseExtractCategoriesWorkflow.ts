import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({
  module: 'DiscourseExtractCategoriesWorkflow',
});

const { fetchCategoriesToS3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseExtractCategoriesWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractCategoriesWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractCategoriesWorkflow) {
  logger.info('Starting DiscourseExtractCategoriesWorkflow', { endpoint });
  await fetchCategoriesToS3(endpoint, formattedDate);
}
