import { Chat, Message, MessageEntity, User } from 'grammy/types';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';
import { chatService } from '../services/chat.service';
import { mentionedService } from '../services/mentioned.service';
import { messageService } from '../services/message.service';
import { userService } from '../services/user.service';

class EditedMessageController {
  async event(
    chat: Chat,
    user: User,
    message: Message,
    mentions: MessageEntity[],
  ): Promise<void> {
    console.debug(`Received ${message.message_id} in ${chat.id}`);
    const session = neo4jService.driver.session();
    const tx = await session.beginTransaction();
    try {
      chatService.createOrUpdate(chat, tx);
      userService.createOrUpdate(user, tx);
      messageService.update(chat, user, message, tx);
      mentionedService.create(chat, message, mentions, tx);
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
export const editedMessageController = new EditedMessageController();
