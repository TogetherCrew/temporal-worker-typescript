export const CREATE_OR_UPDATE_USER = `
MERGE (user:TGUser { id: $user.id })
  ON CREATE
    SET user = apoc.map.merge(user, apoc.map.clean($user, ['id'], [null])),
      user.created_at = timestamp(),
      user.updated_at = timestamp()
  ON MATCH
    SET user = apoc.map.merge(user, apoc.map.clean($user, ['id'], [null])),
      user.updated_at = timestamp()
RETURN user
` as const;
