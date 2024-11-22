import { DiscourseRawPost, DiscourseRawPosts } from 'src/shared/types';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';

const api = new ApiDiscourse();
const g = new KeyGenDiscourse();
const s = new S3Gzip();

interface IFetchBatch {
  lowestId: number;
  batch: DiscourseRawPost[];
}

export async function fetchPostsToS3(
  endpoint: string,
  formattedDate: string,
  minId = 0,
  maxId: number | undefined,
): Promise<{ keys: string[] }> {
  let condition = true;
  let before = maxId;
  const keys = [];

  while (condition) {
    try {
      const data: DiscourseRawPosts = await api.posts(endpoint, before);
      const key = await storePostsS3(
        endpoint,
        `before-${before}`,
        formattedDate,
        data,
      );
      keys.push(key);
      const lowestId = data.latest_posts[data.latest_posts.length - 1].id;
      condition = minId < lowestId;
      before = lowestId - 1;
    } catch (error) {
      console.error('Failed to fetch and store posts', endpoint, before);
      before = before ? before - 1 : undefined;
      // Stop if we've reached the minimum ID
      if (before === undefined || before <= minId) {
        condition = false;
      }
    }
  }
  return { keys };
}

export async function fetchLatestPostId(endpoint: string) {
  const data: DiscourseRawPosts = await api.posts(endpoint, undefined);
  return data.latest_posts[0].id;
}

async function storePostsS3(
  endpoint: string,
  id: string,
  formattedDate: string,
  data: DiscourseRawPosts,
) {
  const key = g.genKey(endpoint, KeyTypeDiscourse.posts, id, formattedDate);
  await s.put(key, data);
  return key;
}
