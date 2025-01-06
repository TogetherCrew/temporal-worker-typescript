export const JOINED_COUNT = `
MATCH (user:TGUser { id: $user.id })-[r:JOINED]->(chat:TGChat { id: $chat.id })
RETURN count(r) AS count
`;

export const CREATE_JOINED = `
MATCH (user:TGUser { id: $user.id })
MATCH (chat:TGChat { id: $chat.id })
MERGE (user)-[r:JOINED { date: $date }]->(chat)
RETURN r
`;
