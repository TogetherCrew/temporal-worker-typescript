import { Chat, Message, MessageEntity, User } from 'grammy/types';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from '../services/chat.service';
import { mentionedService } from '../services/mentioned.service';
import { messageService } from '../services/message.service';
import { userService } from '../services/user.service';
import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ module: 'edited_message.controller' });

class EditedMessageController {
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
      messageService.update(chat, user, message, tx);
      mentionedService.create(chat, message, mentions, tx);
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
export const editedMessageController = new EditedMessageController();
