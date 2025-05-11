import { DiscourseOptionsComputeWorkflow } from 'src/shared/types';

import { executeChild } from '@temporalio/workflow';

import { DiscourseStoreCategoriesWorkflow } from './DiscourseStoreCategoriesWorkflow';
import { DiscourseStorePostsWorkflow } from './DiscourseStorePostsWorkflow';
import { DiscourseStoreTopicsWorkflow } from './DiscourseStoreTopicsWorkflow';
import { DiscourseStoreUserActionsWorkflow } from './DiscourseStoreUserActionsWorkflow';
import { DiscourseStoreUsersWorkflow } from './DiscourseStoreUsersWorkflow';

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
}
