import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { S3_NUM_PARTITIONS } from '../../shared/s3';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { S3Discourse } from '../../libs/discourse/s3/S3Discourse';
import { DiscourseNeo4jAction, DiscourseRawAction } from 'src/shared/types';

const s3 = new S3Discourse();
const neo4j = new Neo4jDiscourse();
const t = new CamelizeTransformer();

export async function storeActionsInNeo4j(endpoint: string) {
  for (let partition = 0; partition < S3_NUM_PARTITIONS; partition++) {
    const batch: DiscourseNeo4jAction[] = (
      await getActionsFromS3(endpoint, partition)
    ).map((raw) => t.transform(raw, { endpoint }));
    console.debug('actions', { partition, batch: batch.length });
    await neo4j.createActions(batch);
  }
}

async function getActionsFromS3(
  endpoint: string,
  partition: number,
): Promise<DiscourseRawAction[]> {
  const keys = await s3.list(`${endpoint}/actions/${partition}/`, '.json.gz');
  return Promise.all(keys.map((key) => s3.getByKey(key)));
}
