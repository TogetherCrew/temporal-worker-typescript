import { Snowflake } from 'discord.js';

import parentLogger from '../../../config/logger.config';
import { GUILD_IGNORED_USERS } from '../../../shared/constants/discordGateway.constant';

const logger = parentLogger.child({
  activity: 'discord:event:ignore-user',
});

function getIgnoredUsersForGuild(guildId: string): Snowflake[] {
  return GUILD_IGNORED_USERS[guildId] || [];
}

export async function isUserIgnored(
  guildId: string,
  userId: Snowflake,
): Promise<boolean> {
  const ignored = getIgnoredUsersForGuild(guildId).includes(userId);
  if (ignored) logger.debug({ guildId, userId }, 'user ignored');
  return ignored;
}
