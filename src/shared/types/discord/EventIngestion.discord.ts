import { DiscordEventType, EventPayloadMap } from './DiscordEvents';
export interface GatewayEventInput<
  T extends DiscordEventType = DiscordEventType,
> {
  type: T;
  guildId: string;
  payload: EventPayloadMap[T];
}
