import { ConfigService } from '../../config/config.service';

export class MongoService {
  protected uri: string;
  private readonly configService = ConfigService.getInstance();
  private readonly dbConfig;

  constructor() {
    this.dbConfig = this.configService.get('db');
    this.uri = this.dbConfig.URI;
  }
}
