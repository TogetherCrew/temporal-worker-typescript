import { DateHelper } from '../helpers/DateHelper';

class TelegramKeyManager {
  private readonly source = 'telegram';
  private readonly dateHelper: DateHelper;

  constructor() {
    this.dateHelper = new DateHelper();
  }

  protected formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return this.dateHelper.formatDate(date);
  }

  getKey(
    timestamp: number,
    chat_id: number,
    update_id: number,
    type: string,
    fileExtension = 'json.gz',
  ) {
    return [
      this.source,
      chat_id,
      this.formatTimestamp(timestamp),
      `${timestamp}-${update_id}-${type}.${fileExtension}`,
    ].join('/');
  }
}

export const keyManager = new TelegramKeyManager();
