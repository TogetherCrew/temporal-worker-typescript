import { Chat, MessageReactionUpdated, User } from 'grammy/types';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from '../services/chat.service';
import { joinedService } from '../services/joined.service';
import { messageReactionService } from '../services/message_reaction.service';
import { userService } from '../services/user.service';
import parentLogger from '../../../config/logger.config';

const logger = parentLogger.child({ module: 'message_reaction.controller' });

class MessageReactionController {
  async event(
    chat: Chat,
    user: User,
    reaction: MessageReactionUpdated,
  ): Promise<void> {
    logger.debug(
      { messageId: reaction.message_id, chatId: chat.id },
      'Received reaction',
    );
    if (!user) {
      logger.debug(
        { messageId: reaction.message_id, chatId: chat.id },
        'The user is anonymous, skipping reaction',
      );
      return;
    }
    const session = neo4jService.driver.session();
    const tx = await session.beginTransaction();
    try {
      chatService.createOrUpdate(chat, tx);
      userService.createOrUpdate(user, tx);
      messageReactionService.create(chat, user, reaction, tx);
      const joinedCount = await joinedService.count(chat, user, tx);
      if (joinedCount == 0) {
        joinedService.create(chat, user, 0, tx);
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
export const messageReactionController = new MessageReactionController();
