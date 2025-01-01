import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';

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
  console.log('Starting DiscourseStoreCategoriesWorkflow');
  await storeCategoriesInNeo4j(endpoint, formattedDate);
  console.log('Finished DiscourseStoreCategoriesWorkflow');
}
