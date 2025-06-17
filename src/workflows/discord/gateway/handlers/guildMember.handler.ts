import type * as Activities from '../../../../activities';
import {
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GatewayGuildMemberUpdateDispatchData,
} from 'discord-api-types/v10';

import { proxyActivities } from '@temporalio/workflow';

const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});

export class GuildMemberHandler {
  static async add(data: GatewayGuildMemberAddDispatchData): Promise<void> {
    const mappedData = await activitiesProxy.mapGuildMemberCreate(data);
    await activitiesProxy.updateMember(
      data.guild_id,
      { discordId: data.user.id },
      {
        ...mappedData,
        deletedAt: null,
      },
    );
  }

  static async update(
    data: GatewayGuildMemberUpdateDispatchData,
  ): Promise<void> {
    const mappedData = await activitiesProxy.mapGuildMemberUpdate(data);
    await activitiesProxy.updateMember(
      data.guild_id,
      { discordId: data.user.id },
      mappedData,
    );
  }

  static async remove(
    data: GatewayGuildMemberRemoveDispatchData,
  ): Promise<void> {
    await activitiesProxy.updateMember(
      data.guild_id,
      { discordId: data.user.id },
      { deletedAt: new Date() },
    );
  }
}
