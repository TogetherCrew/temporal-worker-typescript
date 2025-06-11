import {
    GatewayThreadCreateDispatchData, GatewayThreadDeleteDispatchData,
    GatewayThreadUpdateDispatchData
} from 'discord-api-types/v10';

import { proxyActivities } from '@temporalio/workflow';

import type * as Activities from '../../../../activities';

const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});

export class ThreadHandler {
  static async create(data: GatewayThreadCreateDispatchData): Promise<void> {
    await activitiesProxy.createThread(data.guild_id!, data);
  }

  static async update(data: GatewayThreadUpdateDispatchData): Promise<void> {
    await activitiesProxy.updateThread(data.guild_id!, { id: data.id }, data);
  }

  static async delete(data: GatewayThreadDeleteDispatchData): Promise<void> {
    await activitiesProxy.deleteThread(data.guild_id!, data.id);
  }
}
