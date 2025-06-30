import { Chat } from 'grammy/types';

// List of optional fields to stringify for all chat types
const commonOptionalDict = [
  'photo',
  'pinned_message',
  'permissions',
  'active_usernames',
  'available_reactions',
  'background_custom_emoji_id',
  'bio',
  'birthdate',
  'business_intro',
  'business_location',
  'business_opening_hours',
  'can_set_sticker_set',
  'custom_emoji_sticker_set_name',
  'description',
  'emoji_status_custom_emoji_id',
  'has_aggressive_anti_spam_enabled',
  'has_hidden_members',
  'has_protected_content',
  'has_restricted_voice_and_video_messages',
  'has_visible_history',
  'invite_link',
  'join_by_request',
  'join_to_send_messages',
  'linked_chat_id',
  'location',
  'message_auto_delete_time',
  'personal_chat',
  'slow_mode_delay',
  'sticker_set_name',
  'usernames',
  'accepted_gift_types',
];

// Private chat specific fields
const privateChatOptionalDict = ['chat_photo', 'chat_shared'];

// Group chat specific fields
const groupChatOptionalDict = ['chat_photo', 'chat_shared'];

// Supergroup specific fields
const supergroupOptionalDict = [
  'chat_photo',
  'chat_shared',
  'forum_topic',
  'forum_topic_created',
  'forum_topic_edited',
  'forum_topic_closed',
  'forum_topic_reopened',
  'general_forum_topic_hidden',
  'general_forum_topic_unhidden',
  'giveaway_created',
  'giveaway',
  'giveaway_winners',
  'giveaway_completed',
  'video_chat_scheduled',
  'video_chat_started',
  'video_chat_ended',
  'video_chat_participants_invited',
  'web_app_data',
  'reply_markup',
];

// Channel specific fields
const channelOptionalDict = ['chat_photo', 'chat_shared'];

export function transformTelegramChat(chat: Chat): Record<string, any> {
  // Make a shallow copy of the chat
  const obj: Record<string, any> = { ...chat };

  // Get the appropriate optional dict based on chat type
  let typeSpecificDict: string[] = [];
  if ('type' in chat) {
    switch (chat.type) {
      case 'private':
        typeSpecificDict = privateChatOptionalDict;
        break;
      case 'group':
        typeSpecificDict = groupChatOptionalDict;
        break;
      case 'supergroup':
        typeSpecificDict = supergroupOptionalDict;
        break;
      case 'channel':
        typeSpecificDict = channelOptionalDict;
        break;
    }
  }

  // Combine common and type-specific fields
  const allOptionalFields = [...commonOptionalDict, ...typeSpecificDict];

  // Iterate through optional fields and stringify if present
  allOptionalFields.forEach((dictName) => {
    if (obj[dictName] !== undefined && obj[dictName] !== null) {
      obj[dictName] = JSON.stringify(obj[dictName]);
    }
  });

  return obj;
}
