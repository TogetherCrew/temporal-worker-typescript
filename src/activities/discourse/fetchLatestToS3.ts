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
  await s.put(key, data);
  return key;
}

export async function fetchLatestToS3(
  endpoint: string,
  page: number,
  formattedDate: string,
): Promise<string> {
  try {
    const data: DiscourseRawLatest = await api.latest(endpoint, page);
    if (data.topic_list.topics.length > 0) {
      const key = await storeLatestS3(endpoint, page, formattedDate, data);
      return key
    } else {
      return "Skipped."
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to fetch latest page: ${page} [${endpoint}].`, error.message);
    } else if (error instanceof S3ServiceException) {
      console.error(`Failed to store latest page: ${page} [${endpoint}].`, error.message);
    } else {
      throw error;
    }
  }
}

export async function fetchLatestTopicId(endpoint: string) {
  const data: DiscourseRawLatest = await api.latest(endpoint, undefined);
  return data.topic_list.topics[0].id;
}
