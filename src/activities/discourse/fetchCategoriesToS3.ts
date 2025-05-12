import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import { DiscourseRawCategories } from 'src/shared/types';
import axios from 'axios';
import { S3ServiceException } from '@aws-sdk/client-s3';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'fetchCategoriesToS3' });
const api = new ApiDiscourse();
const g = new KeyGenDiscourse();
const s = new S3Gzip();

export async function fetchCategoriesToS3(
  endpoint: string,
  formattedDate: string,
) {
  try {
    const data: DiscourseRawCategories = await api.categories(endpoint);
    await storeCategoriesS3(endpoint, formattedDate, data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        { endpoint, error: error.message },
        'Failed to fetch categories',
      );
    } else if (error instanceof S3ServiceException) {
      logger.error(
        { endpoint, error: error.message },
        'Failed to store categories',
      );
    }
    logger.error({ error }, 'Categories error');
    throw error;
  }
}

async function storeCategoriesS3(
  endpoint: string,
  formattedDate: string,
  data: DiscourseRawCategories,
) {
  const key = g.getCategoriesKey(endpoint, formattedDate);
  await s.put(key, data);
  return key;
}
