import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseOptionsComputeWorkflow } from 'src/shared/types';

const {
  storeTopicsInNeo4j,
  storePostsInNeo4j,
  storeActionsInNeo4j,
  storeUsersInNeo4j,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1h',
});

export async function DiscourseComputeWorkflow(
  endpoint: string,
  options: DiscourseOptionsComputeWorkflow = {
    topics: true,
    posts: true,
    users: true,
    actions: true,
  },
) {
  console.log('Starting DiscourseComputeWorkflow');
  await Promise.all([
    options.topics ? storeTopicsInNeo4j(endpoint) : undefined,
    options.posts ? storePostsInNeo4j(endpoint) : undefined,
    options.users ? storeUsersInNeo4j(endpoint) : undefined,
    options.actions ? storeActionsInNeo4j(endpoint) : undefined,
  ]);
  console.log('Finished DiscourseComputeWorkflow');
}
