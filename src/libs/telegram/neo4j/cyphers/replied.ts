export const CREATE_REPLIED = `
MATCH (chat:TGChat { id: $chat.id })
MATCH (message:TGMessage { id: $message.message_id })-[:SENT_IN]->(chat)
WHERE NOT EXISTS (()-[:EDITED]->(message))
MATCH (reply_to_message:TGMessage { id: $reply_to_message.message_id })-[:SENT_IN]->(chat)
WHERE NOT EXISTS (()-[:EDITED]->(reply_to_message))
MERGE (message)-[r:REPLIED]->(reply_to_message)
RETURN r
`;
