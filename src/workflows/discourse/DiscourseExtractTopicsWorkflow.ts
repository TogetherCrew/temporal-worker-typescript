import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseRawLatest } from 'src/shared/types';

const { fetchLatestToS3 } = proxyActivities<typeof activities>({
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

  let page: number | undefined = 0;
  while (page !== undefined) {
    try {
      const { nextPage } = await fetchLatestToS3(endpoint, page, formattedDate);

      if (nextPage) {
        page++;
      } else {
        break;
      }
    } catch (error) {
      console.error('Failed to fetch and store topics', { endpoint, page });
      throw error;
    }
  }

  console.log('Finished DiscourseExtractTopicsWorkflow', { endpoint });
}
