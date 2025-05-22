import {
  GatewayGuildMemberAddDispatchData as GuildMemberAddData,
  GatewayGuildMemberUpdateDispatchData as GuildMemberUpdateData,
  GatewayGuildMemberRemoveDispatchData as GuildMemberRemoveData,
} from 'discord-api-types/v10';
import { IGuildMember, IGuildMemberUpdateBody } from '@togethercrew.dev/db';

const mapUser = (user: GuildMemberAddData['user']) => ({
  discordId: user.id,
  username: user.username,
  avatar: user.avatar ?? null,
  discriminator: user.discriminator,
  globalName: (user as any).global_name ?? null,
  isBot: user.bot ?? null,
});

export function mapGuildMemberAdd(payload: GuildMemberAddData): IGuildMember {
  return {
    ...mapUser(payload.user),
    joinedAt: new Date(payload.joined_at),
    roles: payload.roles,
    nickname: payload.nick ?? null,
  };
}

export function mapGuildMemberUpdate(
  payload: GuildMemberUpdateData,
): IGuildMember {
  return {
    ...mapUser(payload.user),
    joinedAt: payload.joined_at ? new Date(payload.joined_at) : undefined,
    roles: payload.roles ?? undefined,
    nickname: payload.nick ?? undefined,
  };
}

export function mapGuildMemberRemove(payload: GuildMemberRemoveData) {
  return {
    discordId: payload.user.id,
    deletedAt: new Date(),
  };
}

export const GuildMemberMappers = {
  add: mapGuildMemberAdd,
  update: mapGuildMemberUpdate,
  remove: mapGuildMemberRemove,
};
