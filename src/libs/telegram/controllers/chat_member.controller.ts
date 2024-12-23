import { Chat, ChatMemberUpdated } from 'grammy/types';
import { determineAction } from '../helpers/determineAction';
import { chatMemberService } from '../services/chat_member.service';

class ChatMemberController {
  public async event(
    chat: Chat,
    chat_member: ChatMemberUpdated,
  ): Promise<void> {
    const {
      date,
      new_chat_member: { user, status },
      old_chat_member,
      from,
    } = chat_member;

    const action = determineAction(old_chat_member.status, status);

    switch (action) {
      case 'LEFT':
        await chatMemberService.left(chat, user, date, from);
        break;
      case 'BANNED':
        await chatMemberService.banned(chat, user, date, from);
        break;
      case 'JOINED':
        await chatMemberService.joined(chat, user, date, from);
        break;
      case 'UNBANNED':
        await chatMemberService.unbanned(chat, user, date, from);
        break;
      case 'RESTRICTED':
        await chatMemberService.restricted(chat, user, date, from);
        break;
      case 'UNRESTRICTED':
        await chatMemberService.unrestricted(chat, user, date, from);
        break;
      case 'PROMOTED':
        await chatMemberService.promoted(chat, user, date, from);
        break;
      case 'DEMOTED':
        await chatMemberService.demoted(chat, user, date, from);
        break;
    }
  }
}

export const chatMemberController = new ChatMemberController();
