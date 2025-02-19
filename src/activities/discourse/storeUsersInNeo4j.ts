import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseNeo4jUser, DiscourseRawUser } from 'src/shared/types';
import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';

const g = new KeyGenDiscourse();
const s = new S3Gzip();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storeUsersInNeo4j(
  endpoint: string,
  formattedDate: string,
  partition: number,
) {
  const prefix = await g.getListPrefix(
    endpoint,
    KeyTypeDiscourse.users,
    formattedDate,
    partition,
  );
  const keys = await s.list(prefix, '.json.gz');

  if (keys.length > 0) {
    const promises = keys.map((key) => processKey(key, endpoint));
    const users = await Promise.all(promises);
    await neo4j.createUsersApoc(users);
  }
}

async function processKey(
  key: string,
  endpoint: string,
): Promise<DiscourseNeo4jUser> {
  const data = (await s.get(key)) as DiscourseRawUser;
  return t.transform(data.user, { endpoint });
}
