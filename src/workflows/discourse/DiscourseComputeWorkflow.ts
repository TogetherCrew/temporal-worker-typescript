import { executeChild } from '@temporalio/workflow';
import { DiscourseOptionsComputeWorkflow } from 'src/shared/types';
import { DiscourseStoreTopicsWorkflow } from './DiscourseStoreTopicsWorkflow';
import { DiscourseStorePostsWorkflow } from './DiscourseStorePostsWorkflow';
import { DiscourseStoreUsersWorkflow } from './DiscourseStoreUsersWorkflow';
import { DiscourseStoreUserActionsWorkflow } from './DiscourseStoreUserActionsWorkflow';
import { DiscourseStoreCategoriesWorkflow } from './DiscourseStoreCategoriesWorkflow';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'DiscourseComputeWorkflow' });

type IDiscourseComputeWorkflow = {
  endpoint: string;
  formattedDate: string;
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
    categories: true,
  },
}: IDiscourseComputeWorkflow) {
  logger.info('Starting DiscourseComputeWorkflow');

  if (options.topics) {
    await executeChild(DiscourseStoreTopicsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.posts) {
    await executeChild(DiscourseStorePostsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.users) {
    await executeChild(DiscourseStoreUsersWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.actions) {
    await executeChild(DiscourseStoreUserActionsWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  if (options.categories) {
    await executeChild(DiscourseStoreCategoriesWorkflow, {
      args: [{ endpoint, formattedDate }],
    });
  }

  logger.info('Finished DiscourseComputeWorkflow');
}
