import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'DiscourseExtractTopicsWorkflow' });

const TOPIC_LIMIT = 30;

const { fetchLatestToS3, fetchLatestTopicId } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '10s',
  retry: {
    maximumAttempts: 2,
  },
});

type IDiscourseExtractTopicsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractTopicsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractTopicsWorkflow) {
  logger.info('Starting DiscourseExtractTopicsWorkflow', { endpoint });

  const maxTopicId = await fetchLatestTopicId(endpoint);
  const maxPage = Math.ceil(maxTopicId / TOPIC_LIMIT);

  const limit = pLimit(100);

  const promises = Array.from({ length: maxPage }, (_, i) => i).map((i) =>
    limit(() => fetchLatestToS3(endpoint, i, formattedDate)),
  );

  await Promise.all(promises);

  logger.info('Finished DiscourseExtractTopicsWorkflow', { endpoint });
}
