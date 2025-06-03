import {
  GatewayChannelCreateDispatchData,
  GatewayChannelUpdateDispatchData,
  GatewayChannelDeleteDispatchData,
} from 'discord-api-types/v10';
import { IChannel, IChannelUpdateBody } from '@togethercrew.dev/db';

const mapChannel = (
  channel: GatewayChannelCreateDispatchData | GatewayChannelUpdateDispatchData,
) => ({
  channelId: channel.id,
  name: channel.name ?? null,
  parentId: channel.parent_id ?? null,
  permissionOverwrites: channel.permission_overwrites,
  type: channel.type,
});

export function mapChannelCreate(
  payload: GatewayChannelCreateDispatchData,
): IChannel {
  return mapChannel(payload);
}

export function mapChannelUpdate(
  payload: GatewayChannelUpdateDispatchData,
): IChannel {
  return mapChannel(payload);
}

export function mapChannelDelete(payload: GatewayChannelDeleteDispatchData) {
  return {
    channelId: payload.id,
    deletedAt: new Date(),
  };
}

export const ChannelMappers = {
  add: mapChannelCreate,
  update: mapChannelUpdate,
  remove: mapChannelDelete,
};
