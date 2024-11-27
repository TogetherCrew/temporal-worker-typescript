import { executeChild, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseOptionsComputeWorkflow } from 'src/shared/types';
import { DiscourseStoreTopicsWorkflow } from './DiscourseStoreTopicsWorkflow';
import { DiscourseStorePostsWorkflow } from './DiscourseStorePostsWorkflow';
import { DiscourseStoreUsersWorkflow } from './DiscourseStoreUsersWorkflow';

const {
  storeTopicsInNeo4j,
  storePostsInNeo4j,
  storeActionsInNeo4j,
  storeUsersInNeo4j,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1h',
  retry: {
    maximumAttempts: 3
  }
});

type IDiscourseComputeWorkflow = {
  endpoint: string;
  formattedDate: string
  options: DiscourseOptionsComputeWorkflow;
};

export async function DiscourseComputeWorkflow({
  endpoint,
  formattedDate,
  options = {
    topics: true,
    posts: true,
    users: true,
    actions: true,
  },
}: IDiscourseComputeWorkflow) {
  console.log('Starting DiscourseComputeWorkflow');

  // if (options.topics) {
  //   await executeChild(DiscourseStoreTopicsWorkflow, {
  //     args: [{ endpoint, formattedDate }],
  //   });
  // }

  // if (options.posts) {
  //   await executeChild(DiscourseStorePostsWorkflow, {
  //     args: [{ endpoint, formattedDate }],
  //   });
  // }

  if (options.users) {
    await executeChild(DiscourseStoreUsersWorkflow, {
      args: [{ endpoint, formattedDate }]
    })
  }


  // await Promise.all([
  //   options.topics ? storeTopicsInNeo4j(endpoint) : undefined,
  //   options.posts ? storePostsInNeo4j(endpoint) : undefined,
  //   options.users ? storeUsersInNeo4j(endpoint) : undefined,
  //   options.actions ? storeActionsInNeo4j(endpoint) : undefined,
  // ]);
  console.log('Finished DiscourseComputeWorkflow');
}
