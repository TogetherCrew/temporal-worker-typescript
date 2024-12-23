function createCypher(edgeName: string): string {
  return `
  MERGE(chat:TGChat { id: $chat.id })
    ON CREATE
      SET chat = apoc.map.merge(chat, apoc.map.clean($chat, ['id'], [null])),
        chat.created_at = timestamp(),
        chat.updated_at = timestamp()
    ON MATCH
        SET chat = apoc.map.merge(chat, apoc.map.clean($chat, ['id'], [null])),
          chat.updated_at = timestamp()
  MERGE (user:TGUser { id: $user.id })
    ON CREATE
      SET user = apoc.map.merge(user, apoc.map.clean($user, ['id'], [null])),
        user.created_at = timestamp(),
        user.updated_at = timestamp()
    ON MATCH
      SET user = apoc.map.merge(user, apoc.map.clean($user, ['id'], [null])),
        user.updated_at = timestamp()
  MERGE (user)-[r:${edgeName} { date: $date, actor: $from.id }]->(chat)
  RETURN chat, user, r`;
}

export const MEMBER_BANNED = createCypher('BANNED');
export const MEMBER_DEMOTED = createCypher('DEMOTED');
export const MEMBER_JOINED = createCypher('JOINED');
export const MEMBER_LEFT = createCypher('LEFT');
export const MEMBER_PROMOTED = createCypher('PROMOTED');
export const MEMBER_RESTRICTED = createCypher('RESTRICTED');
export const MEMBER_UNBANNED = createCypher('UNBANNED');
export const MEMBER_UNRESTRICTED = createCypher('UNRESTRICTED');

export type ChatMemberCypher =
  | typeof MEMBER_BANNED
  | typeof MEMBER_DEMOTED
  | typeof MEMBER_JOINED
  | typeof MEMBER_LEFT
  | typeof MEMBER_PROMOTED
  | typeof MEMBER_RESTRICTED
  | typeof MEMBER_UNBANNED
  | typeof MEMBER_UNRESTRICTED;
