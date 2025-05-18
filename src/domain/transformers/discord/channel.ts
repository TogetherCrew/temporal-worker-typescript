

import { GuildChannel } from 'discord.js';

import { IChannel } from '@togethercrew.dev/db';

export function toIChannel(
  channel: GuildChannel,
): IChannel {
  return {
    channelId: channel.id,
    name: channel.name,
    parentId: channel.parentId,
    permissionOverwrites: Array.from(
      channel.permissionOverwrites.cache.values(),
    ).map((overwrite) => ({
      id: overwrite.id,
      type: overwrite.type,
      allow: overwrite.allow.bitfield.toString(),
      deny: overwrite.deny.bitfield.toString(),
    })),
    type: channel.type,
  };
}
