export const CREATE_MESSAGE = `
MATCH (user:TGUser { id: $user.id })
MATCH (chat:TGChat { id: $chat.id })
MERGE (user)-[:CREATED_MESSAGE]->(message:TGMessage { id: $message.message_id })-[:SENT_IN]->(chat)
  ON CREATE
    SET message = apoc.map.merge(message, apoc.map.clean($message, ['id'], [null])),
        message.created_at = timestamp(),
        message.updated_at = timestamp()
RETURN message
`;

export const UPDATE_MESSAGE = `
MATCH (user:TGUser { id: $user.id })
MATCH (chat:TGChat { id: $chat.id })
MATCH (previous:TGMessage { id: $message.message_id })-[:SENT_IN]->(chat)
WHERE NOT EXISTS ((previous)-[:EDITED]->())
MERGE (user)-[:CREATED_MESSAGE]->(message:TGMessage { id: $message.message_id, edit_date: $message.edit_date })-[:SENT_IN]->(chat)
  ON CREATE
    SET message = apoc.map.merge(message, apoc.map.clean($message, ['id'], [null])),
        message.created_at = timestamp(),
        message.updated_at = timestamp()
MERGE (previous)-[:EDITED]->(message)
RETURN message
`;
