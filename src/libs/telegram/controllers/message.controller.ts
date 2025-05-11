import { Chat, Message, MessageEntity, User } from 'grammy/types';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from '../services/chat.service';
import { joinedService } from '../services/joined.service';
import { mentionedService } from '../services/mentioned.service';
import { messageService } from '../services/message.service';
import { repliedService } from '../services/replied.service';
import { userService } from '../services/user.service';
import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ module: 'message.controller' });

class MessageController {
  async event(
    chat: Chat,
    user: User,
    message: Message,
    mentions: MessageEntity[],
  ): Promise<void> {
    logger.debug(
      { messageId: message.message_id, chatId: chat.id },
      'Received message',
    );
    const session = neo4jService.driver.session();
    const tx = await session.beginTransaction();
    try {
      chatService.createOrUpdate(chat, tx);
      userService.createOrUpdate(user, tx);
      messageService.create(chat, user, message, tx);
      const joinedCount = await joinedService.count(chat, user, tx);
      if (joinedCount == 0) {
        joinedService.create(chat, user, 0, tx);
      }
      const { reply_to_message } = message;
      if (reply_to_message) {
        repliedService.create(chat, message, reply_to_message, tx);
      }
      if (mentions && mentions.length > 0) {
        mentionedService.create(chat, message, mentions, tx);
      }
      await tx.commit();
      logger.debug('Committed tx');
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      session.close();
    }
  }
}

export const messageController = new MessageController();
