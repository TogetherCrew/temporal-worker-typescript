import RabbitMQ, { Queue } from '@togethercrew.dev/tc-messagebroker'
import { config } from '../../config'

export class RabbitMQService {
  private readonly rabbitMQ = RabbitMQ
  private readonly url: string
  private readonly queue: Queue | string

  constructor(
  ) {
    const user = config.RMQ_USER
    const password = config.RMQ_PASS
    const host = config.RMQ_HOST
    const port = config.RMQ_PORT
    this.url = `amqp://${user}:${password}@${host}:${port}`
    this.queue = 'TEMPORAL' // Queue
  }

  public async init() {
    await this.connect(this.url, this.queue)
  }

  private async connect(url: string, queue: string) {
    try {
      await this.rabbitMQ.connect(url, queue)
      console.log(`RabbitMQ connected`)
    } catch (err) {
      console.error(err, `Failed to connect to RabbitMQ`)
    }
  }

  disconnect() { }

  publish(queue: Queue, event: string, content: any) {
    this.rabbitMQ.publish(queue, event, content)
  }

  onEvent(event: string, handler: (msg: any) => void) {
    this.rabbitMQ.onEvent(event, handler)
  }
}