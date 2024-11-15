export const CREATE_ACTION_RESPONDED = [
  'MATCH (p:DiscoursePost { id: $action.postId, endpoint: $action.endpoint })',
  'MATCH (rp:DiscoursePost { topicId: $action.topicId, postNumber: 1, endpoint: $action.endpoint })',
  'MERGE (p)-[action:REPLIED_TO]->(rp)',
  'SET action += $action',
].join(' ');

// Responded is the same as a reply, but to the original topic post, therefore the postNumber is 1.
