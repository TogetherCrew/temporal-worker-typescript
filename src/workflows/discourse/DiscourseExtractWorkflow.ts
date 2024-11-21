import { executeChild, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseComputeWorkflow } from './DiscourseComputeWorkflow';
import { DiscourseOptionsExtractWorkflow } from 'src/shared/types';
import { DiscourseExtractTopicsWorkflow } from './DiscourseExtractTopicsWorkflow';
import { DateHelper } from '../../libs/helpers/DateHelper';

const {
  fetchTopicsToS3,
  fetchPostsToS3,
  fetchActionsToS3,
  fetchUsersToS3,
  storeUsernamesToS3,
  runDiscourseAnalyer,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1h',
});

type IDiscourseExtractWorkflow = {
  endpoint: string;
  platformId: string;
  options: DiscourseOptionsExtractWorkflow;
};

export async function DiscourseExtractWorkflow({
  endpoint,
  platformId,
  options = {
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
    runDiscourseAnalyer: true,
  },
}: IDiscourseExtractWorkflow) {
  console.log('Starting DiscourseExtractWorkflow', { endpoint, platformId });

  const f = new DateHelper()
  const formattedDate = f.formatDate()


  await Promise.all([
    options.topics ? executeChild(DiscourseExtractTopicsWorkflow, { args: [{ endpoint, formattedDate }] }) : undefined
  ])


  // await Promise.all([
  //   options.topics ? fetchTopicsToS3(endpoint) : undefined,
  //   options.posts ? fetchPostsToS3(endpoint) : undefined,
  // ]);

  // if (options.users || options.actions) {
  //   await storeUsernamesToS3(endpoint);
  // }

  // await Promise.all([
  //   options.users ? fetchUsersToS3(endpoint) : undefined,
  //   options.actions ? fetchActionsToS3(endpoint) : undefined,
  // ]);

  // if (Object.values(options.compute).some((value) => value === true)) {
  //   await DiscourseComputeWorkflow({ endpoint, options: options.compute });
  // }

  // if (options.runDiscourseAnalyer) {
  //   await runDiscourseAnalyer(platformId);
  // }

  console.log('Finished DiscourseExtractWorkflow', { endpoint });
}
