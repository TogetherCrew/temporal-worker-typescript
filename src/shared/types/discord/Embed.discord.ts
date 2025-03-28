// Embed
export interface Embed {
  title?: string
  type?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: Record<string, any>
  image?: Record<string, any>
  thumbnail?: Record<string, any>
  video?: Record<string, any>
  provider?: Record<string, any>
  author?: Record<string, any>
  fields?: Array<Record<string, any>>
}