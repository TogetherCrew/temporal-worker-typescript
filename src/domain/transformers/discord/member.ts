// src/domain/transformers/member.transformer.ts
import { GuildMember } from 'discord.js';

import { IGuildMember } from '@togethercrew.dev/db';

export function toIGuildMember(member: GuildMember): IGuildMember {
  return {
    discordId: member.user.id,
    username: member.user.username,
    avatar: member.user.avatar,
    joinedAt: member.joinedAt,
    roles: member.roles.cache.map((role) => role.id),
    discriminator: member.user.discriminator,
    permissions: member.permissions.bitfield.toString(),
    nickname: member.nickname,
    globalName: member.user.globalName,
    isBot: member.user.bot,
  };
}
