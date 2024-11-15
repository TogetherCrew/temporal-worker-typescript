const CREATE_TOPIC = [
  'MERGE (t:DiscourseTopic { id: obj.id, endpoint: obj.endpoint })',
  'SET t += obj',
  'WITH t',
  'MERGE (c:DiscourseCategory { id: t.categoryId, endpoint: t.endpoint })',
  'MERGE (c)-[:HAS_TOPIC]->(t)',
].join(' ');

export const CREATE_TOPICS_APOC = [
  'CALL apoc.periodic.iterate(',
  '"UNWIND $batch as obj RETURN obj"',
  ',',
  `"${CREATE_TOPIC}"`,
  ',',
  '{batchSize: 1000, params: {batch: $data}, parallel: true}',
  ')',
].join(' ');
