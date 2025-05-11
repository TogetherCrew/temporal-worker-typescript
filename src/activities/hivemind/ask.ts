import { HivemindQuestion } from '../../shared/types/hivemind/HivemindQuestion';
import { RabbitMQService } from '../../libs/services/rabbitmq.service';
import { Queue, Event } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'hivemind:ask' });

export async function ask(question: HivemindQuestion): Promise<void> {
  const rabbitmq = new RabbitMQService();
  await rabbitmq.init();
  await rabbitmq.publish(Queue.HIVEMIND, Event.HIVEMIND.QUESTION_RECEIVED, {
    ...question,
  });
  logger.info(
    `Question sent to ${Queue.HIVEMIND} [${Event.HIVEMIND.QUESTION_RECEIVED}]`,
  );
}
