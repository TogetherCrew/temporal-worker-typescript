import { Events } from 'discord.js';

import { IChannel, IGuildMember, IRawInfo, IRole } from '@togethercrew.dev/db';

export type DiscordEventType =
  | Events.ChannelCreate
  | Events.ChannelUpdate
  | Events.ChannelDelete
  | Events.GuildMemberAdd
  | Events.GuildMemberUpdate
  | Events.GuildMemberRemove
  | Events.GuildRoleCreate
  | Events.GuildRoleUpdate
  | Events.GuildRoleDelete
  | Events.MessageCreate
  | Events.MessageUpdate
  | Events.MessageReactionAdd
  | Events.MessageReactionRemove
  | Events.MessageReactionRemoveAll
  | Events.MessageReactionRemoveEmoji
  | Events.MessageDelete
  | Events.MessageBulkDelete
  | Events.UserUpdate;

export interface EventPayloadMap {
  [Events.ChannelCreate]: IChannel;
  [Events.ChannelUpdate]: IChannel;
  [Events.ChannelDelete]: IChannel;
  [Events.GuildMemberAdd]: IGuildMember;
  [Events.GuildMemberUpdate]: IGuildMember;
  [Events.GuildMemberRemove]: IGuildMember;
  [Events.UserUpdate]: IGuildMember;
  [Events.GuildRoleCreate]: IRole;
  [Events.GuildRoleUpdate]: IRole;
  [Events.GuildRoleDelete]: IRole;
  [Events.MessageCreate]: IRawInfo;
  [Events.MessageUpdate]: IRawInfo;
  [Events.MessageReactionAdd]: IRawInfo;
  [Events.MessageReactionRemove]: IRawInfo;
  [Events.MessageReactionRemoveAll]: IRawInfo;
  [Events.MessageReactionRemoveEmoji]: IRawInfo;
  [Events.MessageDelete]: IRawInfo;
  [Events.MessageBulkDelete]: IRawInfo;
}
