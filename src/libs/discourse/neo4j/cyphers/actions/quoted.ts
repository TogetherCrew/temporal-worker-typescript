export const CREATE_ACTION_QUOTED = [
  'MATCH (p:DiscoursePost { id: $action.postId, endpoint: $action.endpoint })',
  'MATCH (u:DiscourseUser { id: $action.targetUserId, endpoint: $action.endpoint })',
  'MERGE (p)-[action:QUOTED]->(u)',
  'SET action += $action',
].join(' ');

// The action doesn't state which post it quoted, only which user
