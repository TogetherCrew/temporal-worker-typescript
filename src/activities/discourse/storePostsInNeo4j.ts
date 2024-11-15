import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { S3_NUM_PARTITIONS } from '../../shared/s3';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseRawPost } from 'src/shared/types';

const s3 = new S3Discourse();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storePostsInNeo4j(endpoint: string) {
  for (let partition = 0; partition < S3_NUM_PARTITIONS; partition++) {
    let batch = await getPostsFromS3(endpoint, partition);
    batch = batch.map((post) => t.transform(post, { endpoint }));
    console.debug('posts', { partition, batch: batch.length });
    await neo4j.createPostsApoc(batch);
  }
}

async function getPostsFromS3(
  endpoint: string,
  partition: number,
): Promise<DiscourseRawPost[]> {
  const keys = await s3.list(`${endpoint}/posts/${partition}/`, '.json.gz');
  return Promise.all(keys.map((key) => s3.getByKey(key)));
}
