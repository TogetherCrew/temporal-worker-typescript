import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';

const { fetchCategoriesToS3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1m',
  retry: {
    maximumAttempts: 3,
  },
});

type IDiscourseExtractPostsWorkflow = {
  endpoint: string;
  formattedDate: string;
};

export async function DiscourseExtractCategoriesWorkflow({
  endpoint,
  formattedDate,
}: IDiscourseExtractPostsWorkflow) {
  console.log('Starting DiscourseExtractCategoriesWorkflow', { endpoint });
  await fetchCategoriesToS3(endpoint, formattedDate);
}
