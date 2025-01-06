import { PlatformNames } from "@togethercrew.dev/db"
import { Queue } from '@togethercrew.dev/tc-messagebroker'
import { Types } from "mongoose"

export interface HivemindQuestion {
  communityId: string | Types.ObjectId
  route: {
    source: PlatformNames
    destination: {
      queue: Queue
      event: string
    }
  }
  question: {
    message: string
    filters?: Record<string, any>
  }
  response?: {
    message: string
  }
  metadata: Record<string, any>
}