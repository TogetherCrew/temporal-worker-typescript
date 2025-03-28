import { PermissionsBitField } from "./PermissionsBitField.discord"

export interface ChatInputCommandInteraction {
  id: string
  applicationId?: string | null
  type?: number | null
  channel?: Record<string, any> | null // ?
  channelId?: string | null
  token?: string | null
  guildId?: string | null
  user?: Record<string, any> | null
  createdAt?: Date | null
  deferred?: boolean | null
  replied?: boolean | null
  webhook?: Record<string, any> | null
  member?: Record<string, any> | null
  ephemeral?: boolean | null
  guild?: Record<string, any> | null // ?
  createdTimestamp?: number | null
  appPermissions?: PermissionsBitField | null
  locale?: string | null
  guildLocale?: string | null
  client?: Record<string, any> | null
  command?: Record<string, any> | null
  commandId?: string | null
  commandName?: string | null
  commandType?: any | null
  commandGuildId?: string | null
  memberPermissions?: PermissionsBitField | null
  options?: Record<string, any> | null
  version?: number | null
}