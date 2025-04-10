export const CREATE_OR_UPDATE_CHAT = `
MERGE (chat:TGChat { id: $chat.id })
  ON CREATE
    SET chat = apoc.map.merge(chat, apoc.map.clean($chat, ['id'], [null])),
      chat.created_at = timestamp(),
      chat.updated_at = timestamp()
  ON MATCH
    SET chat = apoc.map.merge(chat, apoc.map.clean($chat, ['id'], [null])),
      chat.updated_at = timestamp()
RETURN chat
` as const;

export const MIGRATE_CHAT = `
MATCH (chat:TGChat { id: $oldChatId })
SET chat.id = $newChatId
RETURN chat
` as const;
