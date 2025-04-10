import { Queue } from '@togethercrew.dev/tc-messagebroker';
import { RabbitMQService } from '../../libs/services/rabbitmq.service';

export async function publish(
  queue: string,
  event: string,
  data: object,
): Promise<void> {
  const rabbitmq = new RabbitMQService();
  await rabbitmq.init();

  await rabbitmq.publish(queue as Queue, event, data);

  console.log(`Reponse sent to ${queue} [${event}]`);
}
