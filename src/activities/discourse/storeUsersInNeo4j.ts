import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { S3_NUM_PARTITIONS } from '../../shared/s3';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { DiscourseRawUser } from 'src/shared/types';

const s3 = new S3Discourse();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storeUsersInNeo4j(endpoint: string) {
  for (let partition = 0; partition < S3_NUM_PARTITIONS; partition++) {
    let batch = await getUsersFromS3(endpoint, partition);
    batch = batch.map((data) => t.transform(data.user, { endpoint }));
    console.debug('users', { partition, batch: batch.length });
    await neo4j.createUsersApoc(batch);
  }
}

async function getUsersFromS3(
  endpoint: string,
  partition: number,
): Promise<DiscourseRawUser[]> {
  const keys = await s3.list(`${endpoint}/users/${partition}/`, '.json.gz');
  return Promise.all(keys.map((key) => s3.getByKey(key)));
}
