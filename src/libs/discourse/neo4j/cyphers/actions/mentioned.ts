export const CREATE_ACTION_MENTIONED = [
  'MATCH (p:DiscoursePost { id: $action.postId, endpoint: $action.endpoint })',
  'MATCH (u:DiscourseUser { id: $action.targetUserId, endpoint: $action.endpoint })',
  'MERGE (p)-[action:MENTIONED]->(u)',
  'SET action += $action',
].join(' ');
