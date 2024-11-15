const CREATE_USER = [
  'MERGE (u:DiscourseUser { id: obj.id, endpoint: obj.endpoint })',
  'SET u += obj',
].join(' ');

export const CREATE_USERS_APOC = [
  'CALL apoc.periodic.iterate(',
  '"UNWIND $batch as obj RETURN obj"',
  ',',
  `"${CREATE_USER}"`,
  ',',
  '{batchSize: 1000, params: {batch: $data}, parallel: true}',
  ')',
].join(' ');
