import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { S3_NUM_PARTITIONS } from '../../shared/s3';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseRawTopic } from 'src/shared/types';

const s3 = new S3Discourse();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storeTopicsInNeo4j(endpoint: string) {
  for (let partition = 0; partition < S3_NUM_PARTITIONS; partition++) {
    let batch = await getTopicsFromS3(endpoint, partition);
    batch = batch.map((topic) => t.transform(topic, { endpoint }));
    console.debug('topics', { partition, batch: batch.length });
    await neo4j.createTopicsApoc(batch);
  }
}

async function getTopicsFromS3(
  endpoint: string,
  partition: number,
): Promise<DiscourseRawTopic[]> {
  const keys = await s3.list(`${endpoint}/topics/${partition}/`, '.json.gz');
  return Promise.all(keys.map((key) => s3.getByKey(key)));
}
