import { Chat, User } from 'grammy/types';
import { Transaction } from 'neo4j-driver';
import {
  MEMBER_PROMOTED,
  MEMBER_DEMOTED,
  MEMBER_UNRESTRICTED,
  MEMBER_RESTRICTED,
  MEMBER_UNBANNED,
  MEMBER_JOINED,
  MEMBER_BANNED,
  MEMBER_LEFT,
} from '../neo4j/cyphers';
import { ChatMemberCypher } from '../neo4j/cyphers/chat_member';
import { neo4jService } from '../../neo4j/Neo4jClient';

class ChatMemberService {
  async promoted(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_PROMOTED, { chat, user, date, from }, tx);
  }
  async demoted(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_DEMOTED, { chat, user, date, from }, tx);
  }
  async unrestricted(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_UNRESTRICTED, { chat, user, date, from }, tx);
  }
  async restricted(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_RESTRICTED, { chat, user, date, from }, tx);
  }
  async unbanned(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_UNBANNED, { chat, user, date, from }, tx);
  }
  async joined(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_JOINED, { chat, user, date, from }, tx);
  }
  async banned(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_BANNED, { chat, user, date, from }, tx);
  }
  async left(
    chat: Chat,
    user: User,
    date: number,
    from: User,
    tx?: Transaction,
  ) {
    this.write(MEMBER_LEFT, { chat, user, date, from }, tx);
  }

  private async write(cypher: ChatMemberCypher, params: any, tx?: Transaction) {
    if (tx) {
      tx.run(cypher, params);
    } else {
      neo4jService.run(cypher, params);
    }
  }
}

export const chatMemberService = new ChatMemberService();
