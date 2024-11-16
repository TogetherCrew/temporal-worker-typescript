import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseComputeWorkflow } from './DiscourseComputeWorkflow';
import { DiscourseOptionsExtractWorkflow } from 'src/shared/types';

const {
  fetchTopicsToS3,
  fetchPostsToS3,
  fetchActionsToS3,
  fetchUsersToS3,
  storeUsernamesToS3,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1h',
});

export async function DiscourseExtractWorkflow(
  endpoint: string,
  platformId: string,
  options: DiscourseOptionsExtractWorkflow = {
    compute: {
      topics: true,
      posts: true,
      users: true,
      actions: true,
    },
    topics: true,
    posts: true,
    users: true,
    actions: true,
  },
) {
  console.log('Starting DiscourseExtractWorkflow');

  await Promise.all([
    options.topics ? fetchTopicsToS3(endpoint) : undefined,
    options.posts ? fetchPostsToS3(endpoint) : undefined,
  ]);

  if (options.users || options.actions) {
    await storeUsernamesToS3(endpoint);
  }

  await Promise.all([
    options.users ? fetchUsersToS3(endpoint) : undefined,
    options.actions ? fetchActionsToS3(endpoint) : undefined,
  ]);

  if (Object.values(options.compute).some((value) => value === true)) {
    await DiscourseComputeWorkflow(endpoint, options.compute);
  }

  // TODO call airflow api with platformId
  console.log('Finished DiscourseExtractWorkflow');
}
