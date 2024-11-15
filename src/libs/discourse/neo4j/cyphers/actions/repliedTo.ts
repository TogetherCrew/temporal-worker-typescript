export const CREATE_ACTION_REPLIED_TO = [
  'MATCH (p:DiscoursePost { id: $action.postId, endpoint: $action.endpoint })',
  'MATCH (rp:DiscoursePost { topicId: $action.topicId, postNumber: $action.replyToPostNumber, endpoint: $action.endpoint })',
  'MERGE (p)-[action:REPLIED_TO]->(rp)',
  'SET action += $action',
].join(' ');
