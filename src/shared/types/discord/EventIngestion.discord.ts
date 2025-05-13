import { DiscordEventType, EventPayloadMap } from './DiscordEvents';
export interface EventIngestInput<
  T extends DiscordEventType = DiscordEventType,
> {
  type: T;
  guildId: string;
  payload: EventPayloadMap[T];
}
