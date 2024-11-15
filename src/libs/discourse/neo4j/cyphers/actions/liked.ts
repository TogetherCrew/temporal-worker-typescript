export const CREATE_ACTION_LIKED = [
  'MERGE (u:DiscourseUser { id: $action.actingUserId, endpoint: $action.endpoint })',
  'MERGE (p:DiscoursePost { id: $action.postId, endpoint: $action.endpoint })',
  'MERGE (u)-[action:LIKED]->(p)',
  'SET action += $action',
].join(' ');
