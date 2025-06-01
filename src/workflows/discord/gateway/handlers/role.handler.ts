import type * as Activities from '../../../../activities';
import {
  GatewayGuildRoleCreateDispatchData,
  GatewayGuildRoleDeleteDispatchData,
  GatewayGuildRoleUpdateDispatchData,
} from 'discord-api-types/v10';

import { proxyActivities } from '@temporalio/workflow';

const activitiesProxy = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: { maximumAttempts: 5 },
});

export class RoleHandler {
  static async create(data: GatewayGuildRoleCreateDispatchData): Promise<void> {
    const mappedData = await activitiesProxy.mapRoleCreate(data);
    await activitiesProxy.createRole(data.guild_id, mappedData);
  }

  static async update(data: GatewayGuildRoleUpdateDispatchData): Promise<void> {
    const mappedData = await activitiesProxy.mapRoleUpdate(data);
    await activitiesProxy.updateRole(
      data.guild_id,
      { roleId: data.role.id },
      mappedData,
    );
  }

  static async delete(data: GatewayGuildRoleDeleteDispatchData): Promise<void> {
    await activitiesProxy.updateRole(
      data.guild_id,
      { roleId: data.role_id },
      { deletedAt: new Date() },
    );
  }
}
