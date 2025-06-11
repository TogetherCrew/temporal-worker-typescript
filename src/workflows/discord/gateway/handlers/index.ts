import { GatewayDispatchEvents } from 'discord-api-types/v10';

import { ChannelHandler } from './channel.handler';
import { GuildMemberHandler } from './guildMember.handler';
import { MessageHandler } from './message.handler';
import { RoleHandler } from './role.handler';
import { ThreadHandler } from './thread.handler';

export const eventHandlers = {
  [GatewayDispatchEvents.ChannelCreate]: ChannelHandler.create,
  [GatewayDispatchEvents.ChannelUpdate]: ChannelHandler.update,
  [GatewayDispatchEvents.ChannelDelete]: ChannelHandler.delete,

  [GatewayDispatchEvents.GuildMemberAdd]: GuildMemberHandler.add,
  [GatewayDispatchEvents.GuildMemberUpdate]: GuildMemberHandler.update,
  [GatewayDispatchEvents.GuildMemberRemove]: GuildMemberHandler.remove,

  [GatewayDispatchEvents.GuildRoleCreate]: RoleHandler.create,
  [GatewayDispatchEvents.GuildRoleUpdate]: RoleHandler.update,
  [GatewayDispatchEvents.GuildRoleDelete]: RoleHandler.delete,

  [GatewayDispatchEvents.MessageCreate]: MessageHandler.create,
  [GatewayDispatchEvents.MessageUpdate]: MessageHandler.update,
  [GatewayDispatchEvents.MessageDelete]: MessageHandler.delete,
  [GatewayDispatchEvents.MessageDeleteBulk]: MessageHandler.deleteBulk,
  [GatewayDispatchEvents.MessageReactionAdd]: MessageHandler.reactionAdd,
  [GatewayDispatchEvents.MessageReactionRemove]: MessageHandler.reactionRemove,
  [GatewayDispatchEvents.MessageReactionRemoveAll]:
    MessageHandler.reactionRemoveAll,
  [GatewayDispatchEvents.MessageReactionRemoveEmoji]:
    MessageHandler.reactionRemoveEmoji,

  [GatewayDispatchEvents.ThreadCreate]: ThreadHandler.create,
  [GatewayDispatchEvents.ThreadUpdate]: ThreadHandler.update,
  [GatewayDispatchEvents.ThreadDelete]: ThreadHandler.delete,
  // [GatewayDispatchEvents.ThreadListSync]: ThreadHandler.listSync,
  // [GatewayDispatchEvents.ThreadMemberUpdate]: ThreadHandler.memberUpdate,
  // [GatewayDispatchEvents.ThreadMembersUpdate]: ThreadHandler.membersUpdate,
} as const;
