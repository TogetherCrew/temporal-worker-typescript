import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { S3_NUM_PARTITIONS } from '../../shared/s3';
import { DiscourseRawPost } from 'src/shared/types';

const s3 = new S3Discourse();

export async function storeUsernamesToS3(endpoint: string) {
  let usernames: string[] = [];
  for (let partition = 0; partition < S3_NUM_PARTITIONS; partition++) {
    const records = await getPostUsernames(endpoint, partition);
    usernames = Array.from(new Set([...usernames, ...records]));
  }
  await s3.putFixedKey(endpoint, 'usernames.json.gz', usernames);
}

async function getPostUsernames(
  endpoint: string,
  partition: number,
): Promise<string[]> {
  const keys = await s3.list(`${endpoint}/posts/${partition}/`, '.json.gz');
  return Promise.all(
    keys.map(async (key) => {
      const post: DiscourseRawPost = await s3.getByKey(key);
      return post.username;
    }),
  );
}
