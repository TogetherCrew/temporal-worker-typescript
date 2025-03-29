import { AllowedMentions } from "./AllowedMentions.discord"
import { Attachment } from "./Attachment.discord"
import { Embed } from "./Embed.discord"

// InteractionResponseEdit
export interface DiscordInteractionEditResponse {
  thread_id?: number | null
  content?: string | null
  embeds?: Embed[] | null
  allowed_mentions?: AllowedMentions | null
  components?: Array<Array<Record<string, any>>> | null
  files?: Array<Record<string, any>> | null
  payload_json?: string | null
  attachments?: Attachment[] | null
}