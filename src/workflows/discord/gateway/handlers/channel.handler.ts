import {
  GatewayChannelCreateDispatchData,
  GatewayChannelDeleteDispatchData,
  GatewayChannelUpdateDispatchData,
} from 'discord-api-types/v10';

import { proxyActivities } from '@temporalio/workflow';

import type * as Activities from '../../../../activities';

const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});

export class ChannelHandler {
  static async create(data: GatewayChannelCreateDispatchData): Promise<void> {
    const mappedData = await activitiesProxy.mapChannelCreate(data);
    await activitiesProxy.createChannel(data.guild_id, mappedData);
  }

  static async update(data: GatewayChannelUpdateDispatchData): Promise<void> {
    const mappedData = await activitiesProxy.mapChannelUpdate(data);
    await activitiesProxy.updateChannel(
      data.guild_id,
      { channelId: data.id },
      mappedData,
    );
  }

  static async delete(data: GatewayChannelDeleteDispatchData): Promise<void> {
    await activitiesProxy.updateChannel(
      data.guild_id,
      { channelId: data.id },
      { deletedAt: new Date() },
    );
  }
}
