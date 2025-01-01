export const CREATE_CATEGORY = [
  'MERGE (c:DiscourseCategory { id: obj.id, endpoint: obj.endpoint })',
  'SET c.name = obj.name',
  'FOREACH(sub IN obj.subcategoryList |',
  'MERGE (sc:DiscourseCategory { id: sub.id, endpoint: sub.endpoint })',
  'SET sc.name = sub.name',
  'MERGE (sc)-[:IS_SUBCATEGORY]->(c)',
  ')',
].join(' ');

export const CREATE_CATEGORIES_APOC = [
  'CALL apoc.periodic.iterate(',
  '"UNWIND $batch as obj RETURN obj"',
  ',',
  `"${CREATE_CATEGORY}"`,
  ',',
  '{batchSize: 1000, params: {batch: $data}, parallel: true}',
  ')',
].join(' ');
