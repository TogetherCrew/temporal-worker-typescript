import { Message } from 'grammy/types';

export function transformTelegramMessage(message: Message): any {
  const obj: any = { ...message };
  delete obj.from;
  delete obj.chat;
  delete obj.reply_to_message;

  const optional_dict = [
    'sender_business_bot',
    'forward_origin',
    'external_reply',
    'quote',
    'reply_to_story',
    'via_bot',
    'entities',
    'link_preview_options',
    'animation',
    'audio',
    'document',
    'photo',
    'sticker',
    'story',
    'video',
    'video_note',
    'voice',
    'caption_entities',
    'contact',
    'dice',
    'game',
    'poll',
    'venue',
    'location',
    'new_chat_members',
    'left_chat_member',
    'new_chat_photo',
    'message_auto_delete_timer_changed',
    'pinned_message',
    'invoice',
    'successful_payment',
    'users_shared',
    'chat_shared',
    'write_access_allowed',
    'passport_data',
    'proximity_alert_triggered',
    'boost_added',
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

  optional_dict.forEach((dict_name) => {
    if (obj[dict_name]) {
      obj[dict_name] = JSON.stringify(obj[dict_name]);
    }
  });

  return obj;
}
