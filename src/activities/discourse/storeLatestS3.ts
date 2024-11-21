import { DiscourseRawLatest } from "src/shared/types"
import { KeyGenDiscourse, KeyTypeDiscourse } from "../../libs/discourse/KeyGenDiscourse"
import { S3Gzip } from "../../libs/s3/S3Gzip"

const g = new KeyGenDiscourse()
const s = new S3Gzip()

export async function storeLatestS3(endpoint: string, page: number, formattedDate: string, data: DiscourseRawLatest): Promise<string> {
  const key = g.getKey(endpoint, KeyTypeDiscourse.latest, page, formattedDate)
  await s.put(key, data)
  return key
}