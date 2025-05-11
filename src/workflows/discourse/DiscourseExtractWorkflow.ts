import { executeChild, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities';
import { DiscourseOptionsExtractWorkflow } from 'src/shared/types';
import { DateHelper } from '../../libs/helpers/DateHelper';
import { DiscourseExtractPostsWorkflow } from './DiscourseExtractPostsWorkflow';
import { DiscourseComputeWorkflow } from './DiscourseComputeWorkflow';
import { DiscourseExtractTopicsWorkflow } from './DiscourseExtractTopicsWorkflow';
import { DiscourseExtractUserActionsWorkflow } from './DiscourseExtractUserActionsWorkflow';
import { DiscourseExtractCategoriesWorkflow } from './DiscourseExtractCategoriesWorkflow';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'DiscourseExtractWorkflow' });

const { fetchUsersToS3, storeUsernamesToS3, runDiscourseAnalyer } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '1h',
    retry: {
      maximumAttempts: 3,
    },
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
      categories: true,
    },
    topics: true,
    posts: true,
    users: true,
    actions: true,
    categories: true,
    runDiscourseAnalyer: true,
  },
}: IDiscourseExtractWorkflow) {
  logger.info('Starting DiscourseExtractWorkflow', { endpoint, platformId });

  const f = new DateHelper();
  const formattedDate = f.formatDate();

  if (options.topics) {
    await executeChild(DiscourseExtractTopicsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.posts) {
    await executeChild(DiscourseExtractPostsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.users || options.actions) {
    await storeUsernamesToS3(endpoint, formattedDate);
  }

  if (options.users) {
    await fetchUsersToS3(endpoint, formattedDate);
  }

  if (options.actions) {
    await executeChild(DiscourseExtractUserActionsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.categories) {
    await executeChild(DiscourseExtractCategoriesWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (Object.values(options.compute).some((value) => value === true)) {
    await executeChild(DiscourseComputeWorkflow, {
      args: [{ endpoint, formattedDate, options: options.compute }],
    });
  }

  if (options.runDiscourseAnalyer) {
    await runDiscourseAnalyer(platformId);
  }

  logger.info('Finished DiscourseExtractWorkflow', { endpoint });
}
