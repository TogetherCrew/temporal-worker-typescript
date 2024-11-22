import { KeyGenDiscourse, KeyTypeDiscourse, MAX_PARTITIONS } from '../../libs/discourse/KeyGenDiscourse';
import { DiscourseRawPosts } from 'src/shared/types';
import { S3Gzip } from '../../libs/s3/S3Gzip';
import pLimit from 'p-limit';


const g = new KeyGenDiscourse()
const s = new S3Gzip()

export async function storeUsernamesToS3(endpoint: string, formattedDate: string) {
  console.log({ endpoint, formattedDate })

  let usernames = new Set<string>()

  for (let partition = 0; partition < MAX_PARTITIONS; partition++) {
    const prefix = g.getListPrefix(endpoint, KeyTypeDiscourse.posts, formattedDate, partition)
    console.log(prefix)
    const set = await getPostUsernames(prefix);
    console.log(set)
    set.forEach(value => usernames.add(value))
  }
  const key = g.getUsernamesKey(endpoint, formattedDate)
  await s.put(key, Array.from(usernames));
}

async function getPostUsernames(prefix: string, delimiter?: string
): Promise<Set<string>> {
  const keys = await s.list(prefix, delimiter)
  console.log(keys)
  const usernames = new Set<string>()
  const limit = pLimit(1000)

  await Promise.all(
    keys.map((key) => limit(async () => {
      const data: DiscourseRawPosts = await s.get(key) as DiscourseRawPosts;
      for (const p of data.latest_posts) {
        usernames.add(p.username)
      }
    }))
  )
  return usernames
}
