import { APIRole } from 'discord-api-types/v10';
import {
  GatewayGuildRoleCreateDispatchData as GuildRoleCreateData,
  GatewayGuildRoleUpdateDispatchData as GuildRoleUpdateData,
  GatewayGuildRoleDeleteDispatchData as GuildRoleDeleteData,
} from 'discord-api-types/v10';

import { IRole, IRoleUpdateBody } from '@togethercrew.dev/db';

const mapRole = (
  role: GuildRoleCreateData['role'] | GuildRoleUpdateData['role'],
) => ({
  roleId: role.id,
  name: role.name,
  color: role.color,
});

export function mapGuildRoleCreate(payload: GuildRoleCreateData): IRole {
  return mapRole(payload.role);
}

export function mapGuildRoleUpdate(payload: GuildRoleUpdateData): IRole {
  return mapRole(payload.role);
}

export function mapGuildRoleDelete(payload: GuildRoleDeleteData) {
  return {
    roleId: payload.role_id,
    deletedAt: new Date(),
  };
}

export const RoleMappers = {
  add: mapGuildRoleCreate,
  update: mapGuildRoleUpdate,
  remove: mapGuildRoleDelete,
};
