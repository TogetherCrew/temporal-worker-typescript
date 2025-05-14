// src/domain/transformers/member.transformer.ts
import { Role } from 'discord.js';

import { IRole } from '@togethercrew.dev/db';

export function toIRole(role: Role): IRole {
  return {
    roleId: role.id,
    name: role.name,
    color: role.color,
  };
}
