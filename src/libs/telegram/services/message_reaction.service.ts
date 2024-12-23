import { Chat, User, MessageReactionUpdated } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import { CREATE_REACTION } from '../neo4j/cyphers';
import { neo4jService } from '../../../libs/neo4j/Neo4jClient';

class MessageReactionService {
  async create(
    chat: Chat,
    user: User,
    reaction: MessageReactionUpdated,
    tx?: Transaction,
  ): Promise<void> {
    if (tx) {
      tx.run(CREATE_REACTION, {
        chat,
        user,
        reaction: this.transformReaction(reaction),
      });
    } else {
      neo4jService.run(CREATE_REACTION, {
        chat,
        user,
        reaction: this.transformReaction(reaction),
      });
    }
  }

  private transformReaction(reaction: MessageReactionUpdated): any {
    const obj: any = { ...reaction };
    delete obj.actor_chat;
    delete obj.chat;
    delete obj.user;

    obj.new_reaction = JSON.stringify(obj.new_reaction);
    obj.old_reaction = JSON.stringify(obj.old_reaction);
    return obj;
  }
}

export const messageReactionService = new MessageReactionService();
