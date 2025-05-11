import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'DiscourseExtractPostsWorkflow' });

const MAX_GROUPED_REQUESTS = 500;
const MAX_PARALLEL = 5;

const { fetchPostsToS3, fetchLatestPostId } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseExtractPostsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractPostsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractPostsWorkflow) {
  logger.info('Starting DiscourseExtractPostsWorkflow', { endpoint });

  const max = await fetchLatestPostId(endpoint);

  const groups = Array.from({ length: MAX_PARALLEL }, () => []);
  let counter = 0;

  for (let minId = 0; minId <= max; minId += MAX_GROUPED_REQUESTS) {
    counter++;
    const groupId = counter % MAX_PARALLEL;

    const maxId = minId + MAX_GROUPED_REQUESTS - 1;

    await groups[groupId].push(
      fetchPostsToS3(endpoint, formattedDate, minId, maxId),
    );
  }

  for (const group of groups) {
    await Promise.all(group);
  }

  logger.info('Finished DiscourseExtractPostsWorkflow', { endpoint });
}
