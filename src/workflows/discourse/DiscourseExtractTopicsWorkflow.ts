import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import pLimit from 'p-limit';

const TOPIC_LIMIT = 30;

const { fetchLatestToS3, fetchLatestTopicId } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1h',
});

type IDiscourseExtractTopicsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractTopicsWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractTopicsWorkflow) {
  console.log('Starting DiscourseExtractTopicsWorkflow', { endpoint });

  const maxTopicId = await fetchLatestTopicId(endpoint);
  const maxPage = Math.ceil(maxTopicId / TOPIC_LIMIT);

  const limit = pLimit(1000);

  const promises = Array.from({ length: maxPage }, (_, i) => i).map((i) =>
    limit(() => fetchLatestToS3(endpoint, i, formattedDate)),
  );

  await Promise.all(promises);

  console.log('Finished DiscourseExtractTopicsWorkflow', { endpoint });
}
