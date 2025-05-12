import RabbitMQ, { Queue } from '@togethercrew.dev/tc-messagebroker';
import { ConfigService } from '../../config/config.service';
import parentLogger from '../../config/logger.config';

export class RabbitMQService {
  private readonly rabbitMQ = RabbitMQ;
  private readonly url: string;
  private readonly queue: Queue | string;
  private readonly configService = ConfigService.getInstance();
  private readonly rmqConfig;
  private readonly logger = parentLogger.child({ module: 'RabbitMQService' });

  constructor() {
    this.rmqConfig = this.configService.get('rmq');
    const user = this.rmqConfig.USER;
    const password = this.rmqConfig.PASS;
    const host = this.rmqConfig.HOST;
    const port = this.rmqConfig.PORT;
    this.url = `amqp://${user}:${password}@${host}:${port}`;
    this.queue = 'TEMPORAL'; // Queue
  }

  public async init() {
    await this.connect(this.url, this.queue);
  }

  private async connect(url: string, queue: string) {
    try {
      await this.rabbitMQ.connect(url, queue);
      this.logger.info(`RabbitMQ connected`);
    } catch (err) {
      this.logger.error(err, `Failed to connect to RabbitMQ`);
    }
  }

  disconnect() {}

  publish(queue: Queue, event: string, content: any) {
    this.rabbitMQ.publish(queue, event, content);
  }

  onEvent(event: string, handler: (msg: any) => void) {
    this.rabbitMQ.onEvent(event, handler);
  }
}
