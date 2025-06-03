import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Snowflake } from 'discord.js';

type GuildIgnoredUsers = Record<string, Snowflake[]>;

export const GUILD_IGNORED_USERS: GuildIgnoredUsers = {
  '585084330037084172': ['641449673818898472'],
};

export const SUPPORTED_GATEWAY_EVENTS = [
  GatewayDispatchEvents.ChannelCreate,
  GatewayDispatchEvents.ChannelUpdate,
  GatewayDispatchEvents.ChannelDelete,
  GatewayDispatchEvents.GuildMemberAdd,
  GatewayDispatchEvents.GuildMemberUpdate,
  GatewayDispatchEvents.GuildMemberRemove,
  GatewayDispatchEvents.GuildRoleCreate,
  GatewayDispatchEvents.GuildRoleUpdate,
  GatewayDispatchEvents.GuildRoleDelete,
  GatewayDispatchEvents.MessageCreate,
  GatewayDispatchEvents.MessageUpdate,
  GatewayDispatchEvents.MessageDelete,
  GatewayDispatchEvents.MessageDeleteBulk,
  GatewayDispatchEvents.MessageReactionAdd,
  GatewayDispatchEvents.MessageReactionRemove,
  GatewayDispatchEvents.MessageReactionRemoveAll,
  GatewayDispatchEvents.MessageReactionRemoveEmoji,
] as const;

export type SupportedGatewayEvent = (typeof SUPPORTED_GATEWAY_EVENTS)[number];
