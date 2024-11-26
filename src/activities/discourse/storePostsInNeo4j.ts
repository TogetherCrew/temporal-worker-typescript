import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseNeo4jPost, DiscourseRawPosts } from 'src/shared/types';
import { KeyGenDiscourse, KeyTypeDiscourse } from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';

const g = new KeyGenDiscourse();
const s = new S3Gzip();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();


export async function storePostsInNeo4j(endpoint: string, formattedDate: string, partition: number) {
  console.log('storePostsInNeo4j', { endpoint, formattedDate, partition })
  const prefix = await g.getListPrefix(endpoint, KeyTypeDiscourse.posts, formattedDate, partition)
  console.log({ prefix })
  const keys = await s.list(prefix, '.json.gz')
  console.log({ keys })

  if (keys.length > 0) {
    const promises = keys.map(key => processKey(key, endpoint))
    const posts = (await Promise.all(promises)).flat()
    console.debug(posts.length)
    await neo4j.createPostsApoc(posts)
  }
}

async function processKey(key: string, endpoint: string): Promise<DiscourseNeo4jPost[]> {
  console.log(key)
  const data = await s.get(key) as DiscourseRawPosts
  return data.latest_posts.map(post => t.transform(post, { endpoint }))
}