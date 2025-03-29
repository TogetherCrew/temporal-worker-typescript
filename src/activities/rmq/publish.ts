import { Queue, Event } from '@togethercrew.dev/tc-messagebroker';
import { RabbitMQService } from 'src/libs/services/rabbitmq.service';

export async function publish(queue: Queue, event: string, data: object): Promise<void> {
  const rabbitmq = new RabbitMQService();
  await rabbitmq.init();

  await rabbitmq.publish(queue, event, data);

  console.log(
    `Reponse sent to ${Queue.DISCORD_BOT} [${Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT}]`,
  );
}
