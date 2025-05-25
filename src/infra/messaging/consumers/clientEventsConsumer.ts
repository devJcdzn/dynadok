import { EventBus } from "../eventBus";

export class ClientEventsConsumer {
  constructor(private eventBus: EventBus) {}

  async start() {
    const channel = await this.eventBus.connect();

    const queues = ["client.created", "client.updated", "client.deleted"];
    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      channel.consume(queue, (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log(`👂 Event received on ${queue}:`, data);
          // Aqui você pode executar lógica especializada por tipo de evento
          channel.ack(msg);
        }
      });
    }
  }
}
