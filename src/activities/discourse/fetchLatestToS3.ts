import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { DiscourseRawLatest } from 'src/shared/types';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import { S3ServiceException } from '@aws-sdk/client-s3';
import axios from 'axios';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'fetchLatestToS3' });
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
  // logger.debug({ key }, 'Generated key');
  await s.put(key, data);
  // logger.debug({ key }, 'Stored data');
  return key;
}

export async function fetchLatestToS3(
  endpoint: string,
  page: number,
  formattedDate: string,
): Promise<string> {
  try {
    const data: DiscourseRawLatest = await api.latest(endpoint, page);
    // logger.debug({ endpoint, page, topicsCount: data.topic_list.topics.length }, 'Fetched data');
    if (data.topic_list.topics.length > 0) {
      const key = await storeLatestS3(endpoint, page, formattedDate, data);
      // logger.debug({ endpoint, page }, 'Stored the data');
      return key;
    } else {
      return 'Skipped.';
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        { endpoint, page, error: error.message },
        'Failed to fetch latest page',
      );
    } else if (error instanceof S3ServiceException) {
      logger.error(
        { endpoint, page, error: error.message },
        'Failed to store latest page',
      );
    }
    logger.error({ error }, 'Latest fetch/store error');
    throw error;
  }
}

export async function fetchLatestTopicId(endpoint: string): Promise<number> {
  const data: DiscourseRawLatest = await api.latest(endpoint, undefined);
  const maxId = data.topic_list.topics[0].id;
  logger.debug({ endpoint, maxId }, 'Fetched max topic id');
  return maxId;
}
