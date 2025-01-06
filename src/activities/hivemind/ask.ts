import { HivemindQuestion } from "../../shared/types/hivemind/HivemindQuestion";
import { RabbitMQService } from "../../libs/services/rabbitmq.service";
import { Queue, Event } from "@togethercrew.dev/tc-messagebroker";

export async function ask(question: HivemindQuestion): Promise<void> {
  const rabbitmq = new RabbitMQService()
  await rabbitmq.init()
  await rabbitmq.publish(Queue.HIVEMIND, Event.HIVEMIND.QUESTION_RECEIVED, { ...question })
  console.log(`Question sent to ${Queue.HIVEMIND} [${Event.HIVEMIND.QUESTION_RECEIVED}]`)
}