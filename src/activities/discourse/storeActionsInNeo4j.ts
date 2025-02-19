import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseNeo4jAction, DiscourseRawActions } from 'src/shared/types';
import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';

const g = new KeyGenDiscourse();
const s = new S3Gzip();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storeActionsInNeo4j(
  endpoint: string,
  formattedDate: string,
  partition: number,
) {
  const prefix = await g.getListPrefix(
    endpoint,
    KeyTypeDiscourse.user_actions,
    formattedDate,
    partition,
  );
  const keys = await s.list(prefix, '.json.gz');

  if (keys.length > 0) {
    const promises = keys.map((key) => processKey(key, endpoint));
    const actions = (await Promise.all(promises)).flat();
    await neo4j.createActions(actions);
  }
}

async function processKey(
  key: string,
  endpoint: string,
): Promise<DiscourseNeo4jAction[]> {
  const data = (await s.get(key)) as DiscourseRawActions;
  return data.user_actions.map((post) => t.transform(post, { endpoint }));
}
