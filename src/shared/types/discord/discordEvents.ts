import { Events } from 'discord.js';

import { IChannel, IGuildMember, IRole } from '@togethercrew.dev/db';

export type DiscordEventType =
  | Events.ChannelCreate
  | Events.ChannelUpdate
  | Events.ChannelDelete
  | Events.GuildMemberAdd
  | Events.GuildMemberUpdate
  | Events.GuildMemberRemove
  | Events.GuildRoleCreate
  | Events.GuildRoleUpdate
  | Events.GuildRoleDelete;

export interface EventPayloadMap {
  [Events.ChannelCreate]: IChannel;
  [Events.ChannelUpdate]: IChannel;
  [Events.ChannelDelete]: IChannel;
  [Events.GuildMemberAdd]: IGuildMember;
  [Events.GuildMemberUpdate]: IGuildMember;
  [Events.GuildMemberRemove]: IGuildMember;
  [Events.GuildRoleCreate]: IRole;
  [Events.GuildRoleUpdate]: IRole;
  [Events.GuildRoleDelete]: IRole;
}
