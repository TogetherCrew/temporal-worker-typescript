import { Snowflake } from 'discord.js';
import {
  DatabaseManager,
  makeRoleRepository,
  IRole,
} from '@togethercrew.dev/db';
import parentLogger from '../../config/logger.config';
const logger = parentLogger.child({ activity: 'discord:role' });

export async function createRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);

  try {
    await repo.create(data);
  } catch (err: any) {
    if (err.code === 11000) {
      logger.warn({ guildId, roleId: data.roleId }, 'Role already exists');
    } else {
      throw err;
    }
  }
}

export async function updateRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);

  const res = await repo.updateOne({ roleId: data.roleId }, data);
  if (!res.modifiedCount) await repo.create(data);
}

export async function softDeleteRole(
  guildId: Snowflake,
  data: IRole,
): Promise<void> {
  const dbConnection = await DatabaseManager.getInstance().getGuildDb(guildId);
  const repo = makeRoleRepository(dbConnection);
  await repo.updateOne({ roleId: data.roleId }, { deletedAt: new Date() });
}
