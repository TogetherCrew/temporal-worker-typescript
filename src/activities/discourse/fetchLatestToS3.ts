import { KeyGenDiscourse, KeyTypeDiscourse } from "../../libs/discourse/KeyGenDiscourse";
import { ApiDiscourse } from "../../libs/discourse/ApiDiscourse";
import { DiscourseRawLatest } from "src/shared/types";
import { S3Gzip } from "../../libs/s3/S3Gzip";

const api = new ApiDiscourse()
const g = new KeyGenDiscourse()
const s = new S3Gzip()

async function storeLatestS3(endpoint: string, page: number, formattedDate: string, data: DiscourseRawLatest): Promise<string> {
  const key = g.genKey(endpoint, KeyTypeDiscourse.latest, page, formattedDate)
  await s.put(key, data)
  return key
}

export async function fetchLatestToS3(endpoint: string, page: number, formattedDate: string): Promise<{ key: string, nextPage: boolean }> {
  const data: DiscourseRawLatest = await api.latest(endpoint, page);
  const key = await storeLatestS3(endpoint, page, formattedDate, data)

  const nextPage = data.topic_list.more_topics_url ? true : false

  return { key, nextPage }
}