import { Message } from 'grammy/types';

// List of optional fields to stringify
const optionalDict = [
  'sender_business_bot', 'forward_origin', 'external_reply', 'quote', 'reply_to_story',
  'via_bot', 'entities', 'link_preview_options', 'animation', 'audio', 'document',
  'photo', 'sticker', 'story', 'video', 'video_note', 'voice', 'caption_entities',
  'contact', 'dice', 'game', 'poll', 'venue', 'location', 'new_chat_members',
  'left_chat_member', 'new_chat_photo', 'message_auto_delete_timer_changed',
  'pinned_message', 'invoice', 'successful_payment', 'users_shared', 'chat_shared',
  'write_access_allowed', 'passport_data', 'proximity_alert_triggered', 'boost_added',
  'forum_topic_created', 'forum_topic_edited', 'forum_topic_closed', 'forum_topic_reopened',
  'general_forum_topic_hidden', 'general_forum_topic_unhidden', 'giveaway_created', 'giveaway',
  'giveaway_winners', 'giveaway_completed', 'video_chat_scheduled', 'video_chat_started',
  'video_chat_ended', 'video_chat_participants_invited', 'web_app_data', 'reply_markup'
];

export function transformTelegramMessage(message: Message): Record<string, any> {
  // Make a shallow copy of the message
  const obj: Record<string, any> = { ...message };

  // Remove unnecessary fields
  delete obj.from;
  delete obj.chat;
  delete obj.reply_to_message;

  // Iterate through optional fields and stringify if present
  optionalDict.forEach((dictName) => {
    if (obj[dictName] !== undefined && obj[dictName] !== null) {
      obj[dictName] = JSON.stringify(obj[dictName]);
    }
  });

  return obj;
}
