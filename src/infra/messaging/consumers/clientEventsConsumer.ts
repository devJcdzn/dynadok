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

          switch (queue) {
            case "client.created":
              console.log("🔥 Ação para criação do cliente...");
              break;
            case "client.updated":
              console.log("🔥 Ação para atualizaçãos do cliente...");
              break;
            case "client.deleted":
              console.log("🔥 Ação para deleção do cliente...");
              break;
          }
          channel.ack(msg);
        }
      });
    }
  }
}
