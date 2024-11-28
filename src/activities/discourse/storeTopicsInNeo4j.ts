import { CamelizeTransformer } from '../../libs/transformers/CamelizeTransformer';
import { Neo4jDiscourse } from '../../libs/discourse/neo4j/Neo4jDiscourse';
import { DiscourseNeo4jTopic, DiscourseRawLatest } from 'src/shared/types';
import {
  KeyGenDiscourse,
  KeyTypeDiscourse,
} from '../../libs/discourse/KeyGenDiscourse';
import { S3Gzip } from '../../libs/s3/S3Gzip';

const g = new KeyGenDiscourse();
const s = new S3Gzip();
const t = new CamelizeTransformer();
const neo4j = new Neo4jDiscourse();

export async function storeTopicsInNeo4j(
  endpoint: string,
  formattedDate: string,
  partition: number,
) {
  const prefix = await g.getListPrefix(
    endpoint,
    KeyTypeDiscourse.latest,
    formattedDate,
    partition,
  );
  const keys = await s.list(prefix, '.json.gz');

  if (keys.length > 0) {
    const promises = keys.map((key) => processKey(key, endpoint));
    const topics = (await Promise.all(promises)).flat();
    await neo4j.createTopicsApoc(topics);
  }
}

async function processKey(
  key: string,
  endpoint: string,
): Promise<DiscourseNeo4jTopic[]> {
  const data = (await s.get(key)) as DiscourseRawLatest;
  return data.topic_list.topics.map((topic) =>
    t.transform(topic, { endpoint }),
  );
}
