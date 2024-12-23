import { Chat, MessageReactionUpdated, User } from 'grammy/types';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from '../services/chat.service';
import { joinedService } from '../services/joined.service';
import { messageReactionService } from '../services/message_reaction.service';
import { userService } from '../services/user.service';

class MessageReactionController {
  async event(
    chat: Chat,
    user: User,
    reaction: MessageReactionUpdated,
  ): Promise<void> {
    console.debug(`Received ${reaction.message_id} in ${chat.id}.`);
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
      console.debug('Commited tx.');
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      session.close();
    }
  }
}
export const messageReactionController = new MessageReactionController();
