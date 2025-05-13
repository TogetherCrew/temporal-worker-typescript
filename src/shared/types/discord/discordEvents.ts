import { Events } from 'discord.js';
import { IChannel } from '@togethercrew.dev/db';
export type DiscordEventType =
  | Events.ChannelCreate
  | Events.ChannelUpdate
  | Events.ChannelDelete;

export interface EventPayloadMap {
  [Events.ChannelCreate]: IChannel;
  [Events.ChannelUpdate]: IChannel;
  [Events.ChannelDelete]: IChannel;
}

export interface EventIngestInput<
  T extends DiscordEventType = DiscordEventType,
> {
  type: T;
  guildId: string;
  payload: EventPayloadMap[T];
}
