export const CREATE_MENTIONED = `
MATCH (message:TGMessage { id: $message.message_id })-[:SENT_IN]->(chat:TGChat { id: $chat.id })
WHERE NOT EXISTS (()-[:EDITED]->(message))
WITH message, $mentions AS mentions
  UNWIND mentions AS username
    MATCH (user:TGUser { username: username })
    MERGE (message)-[r:MENTIONED]->(user)
  RETURN collect(r)
`;
