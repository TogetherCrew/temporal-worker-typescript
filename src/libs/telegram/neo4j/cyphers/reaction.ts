export const CREATE_REACTION = `
MATCH (chat:TGChat { id: $chat.id })
MATCH (message:TGMessage { id: $reaction.message_id })-[:SENT_IN]->(chat)
WHERE NOT EXISTS (()-[:EDITED]->(message))
MATCH (user:TGUser { id: $user.id })
MERGE (user)-[r:REACTED_TO { date: $reaction.date }]->(message)
  ON CREATE
    SET r = apoc.map.merge(r, $reaction),
      r.created_at = timestamp(),
      r.updated_at = timestamp()
  RETURN r
`;
