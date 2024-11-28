import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { DiscourseRawLatest } from 'src/shared/types';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import { S3ServiceException } from '@aws-sdk/client-s3';
import axios from 'axios';

const api = new ApiDiscourse();
const g = new KeyGenDiscourse();
const s = new S3Gzip();

async function storeLatestS3(
  endpoint: string,
  page: number,
  formattedDate: string,
  data: DiscourseRawLatest,
): Promise<string> {
  const key = g.genKey(endpoint, KeyTypeDiscourse.latest, page, formattedDate);
  console.debug(key)
  await s.put(key, data);
  console.debug(`I stored ${key}.`)
  return key;
}

export async function fetchLatestToS3(
  endpoint: string,
  page: number,
  formattedDate: string,
): Promise<string> {
  try {
    const data: DiscourseRawLatest = await api.latest(endpoint, page);
    console.debug(`I fetched data [${data.topic_list.topics.length}] for page: ${page} [${endpoint}].`);
    if (data.topic_list.topics.length > 0) {
      const key = await storeLatestS3(endpoint, page, formattedDate, data);
      console.debug(`I stored the data for page: ${page} [${endpoint}].`);
      return key;
    } else {
      return 'Skipped.';
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to fetch latest page: ${page} [${endpoint}].`);
    } else if (error instanceof S3ServiceException) {
      console.error(`Failed to store latest page: ${page} [${endpoint}].`);
    }
    console.error(error)
    throw error;
  }
}

export async function fetchLatestTopicId(endpoint: string): Promise<number> {
  const data: DiscourseRawLatest = await api.latest(endpoint, undefined);
  const maxId = data.topic_list.topics[0].id;
  console.debug(`I fetched max topic id  ${maxId}. [${endpoint}].`);
  return maxId;
}
