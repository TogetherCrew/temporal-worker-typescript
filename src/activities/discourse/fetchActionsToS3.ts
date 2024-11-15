import { DiscourseRawAction } from 'src/shared/types';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';

const api = new ApiDiscourse();
const s3 = new S3Discourse();

export async function fetchActionsToS3(endpoint: string) {
  const usernames: string[] = await s3.get(endpoint, 'other', 'usernames');
  console.debug('fetchActionsToS3', usernames.length);

  await Promise.all(
    usernames.map((username) => fetchActionsForUsername(endpoint, username)),
  );
}

async function fetchActionsForUsername(endpoint: string, username: string) {
  let condition = true;
  let offset = 0;
  const limit = 50;
  while (condition) {
    try {
      const batch = await fetchBatch(endpoint, username, offset, limit);
      await storeBatch(endpoint, batch);

      if (batch.length < limit) {
        condition = false;
      } else {
        offset += limit;
      }
    } catch (error) {
      console.error('Failed to fetch actions', {
        endpoint,
        username,
        offset,
        limit,
      });
      condition = false;
    }
  }
}

async function fetchBatch(
  endpoint: string,
  username: string,
  offset = 0,
  limit = 50,
): Promise<DiscourseRawAction[]> {
  const { user_actions } = await api.actions(endpoint, username, offset, limit);
  return user_actions;
}

async function storeBatch(
  endpoint: string,
  // username: string,
  batch: DiscourseRawAction[],
) {
  Promise.all(
    batch.map((action) => s3.put(endpoint, 'actions', undefined, action)),
  );
}
