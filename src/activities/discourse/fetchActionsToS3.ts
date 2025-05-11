import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import pLimit from 'p-limit';
import { S3ServiceException } from '@aws-sdk/client-s3';
import axios from 'axios';
import { DiscourseRawUser } from 'src/shared/types';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'fetchActionsToS3' });
const a = new ApiDiscourse();
const g = new KeyGenDiscourse();
const s = new S3Gzip();

export async function fetchActionsToS3(
  endpoint: string,
  formattedDate: string,
  partition: number,
) {
  const prefix = await g.getListPrefix(
    endpoint,
    KeyTypeDiscourse.users,
    formattedDate,
    partition,
  );
  const keys = await s.list(prefix);
  const limit = pLimit(500);

  await Promise.all(
    keys.map((key) =>
      limit(async () => {
        const data: DiscourseRawUser = (await s.get(key)) as DiscourseRawUser;
        const username = data.user.username;
        await fetchActionsForUsername(endpoint, username, formattedDate);
      }),
    ),
  );
}

async function fetchActionsForUsername(
  endpoint: string,
  username: string,
  formattedDate: string,
): Promise<void> {
  let condition = true;
  let offset = 0;
  const limit = 50;
  while (condition) {
    try {
      const data = await a.actions(endpoint, username, offset, limit);
      const key = g.genKey(
        endpoint,
        KeyTypeDiscourse.user_actions,
        `${username}-${offset}`,
        formattedDate,
      );
      await s.put(key, data);

      if (data.user_actions.length < limit) {
        condition = false;
      } else {
        offset += limit;
      }
    } catch (error) {
      condition = false;
      if (axios.isAxiosError(error)) {
        logger.error(
          { username, endpoint, error: error.message },
          'Failed to fetch username',
        );
      } else if (error instanceof S3ServiceException) {
        logger.error(
          { username, endpoint, error: error.message },
          'Failed to store username',
        );
      } else {
        throw error;
      }
    }
  }
}
