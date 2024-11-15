import { DiscourseRawPost } from 'src/shared/types';
import { ApiDiscourse } from '../../libs/discourse/ApiDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { S3_NUM_PARTITIONS } from '../../shared/s3';

const api = new ApiDiscourse();
const s3 = new S3Discourse();

interface IFetchBatch {
  lowestId: number;
  batch: DiscourseRawPost[];
}

export async function fetchPostsToS3(endpoint: string) {
  const { lowestId, batch } = await fetchBatch(endpoint, undefined);
  await storeBatch(endpoint, batch);

  const groups = [];
  for (let i = 0; i <= lowestId; i += S3_NUM_PARTITIONS) {
    const maxId = i + S3_NUM_PARTITIONS - 1;
    console.debug(i, maxId);
    groups.push(fetchPostsToS3InGroups(endpoint, i, maxId));
  }

  await Promise.all(groups);
}

async function fetchPostsToS3InGroups(
  endpoint: string,
  minId = 0,
  maxId: number | undefined,
) {
  let condition = true;
  let before = maxId;

  while (condition) {
    try {
      const { lowestId, batch }: IFetchBatch = await fetchBatch(
        endpoint,
        before,
      );
      await storeBatch(endpoint, batch);
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
}

async function fetchBatch(
  endpoint: string,
  before: number | undefined,
): Promise<IFetchBatch> {
  const { latest_posts } = await api.posts(endpoint, before);
  let lowestId = 0;
  if (latest_posts.length > 1) {
    lowestId = latest_posts[latest_posts.length - 1].id;
  }
  return { lowestId, batch: latest_posts };
}

async function storeBatch(endpoint: string, batch: DiscourseRawPost[]) {
  Promise.all(batch.map((post) => s3.put(endpoint, 'posts', post.id, post)));
}
