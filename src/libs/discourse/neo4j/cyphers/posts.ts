export const CREATE_POST = [
  'MERGE (p:DiscoursePost { id: obj.id, endpoint: obj.endpoint })',
  'SET p += obj',
  'WITH p',
  'MERGE (t:DiscourseTopic { id: p.topicId, endpoint: p.endpoint })',
  'MERGE (t)-[:HAS_POST]->(p)',
  'WITH p',
  'MERGE (u:DiscourseUser { id: p.userId, endpoint: p.endpoint })',
  'SET u.username = p.username',
  'MERGE (u)-[:POSTED]->(p)',
].join(' ');

export const CREATE_POSTS_APOC = [
  'CALL apoc.periodic.iterate(',
  '"UNWIND $batch as obj RETURN obj"',
  ',',
  `"${CREATE_POST}"`,
  ',',
  '{batchSize: 1000, params: {batch: $data}, parallel: true}',
  ')',
].join(' ');
