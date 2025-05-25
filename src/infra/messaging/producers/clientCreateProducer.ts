// src/infrastructure/messaging/producers/ClientCreatedProducer.ts
import { IEventProducer } from "../eventProducer";
import { EventBus } from "../eventBus";

export class ClientCreatedProducer
  implements IEventProducer<{ id: string; name: string }>
{
  constructor(private eventBus: EventBus) {}

  async publish(event: { id: string; name: string }): Promise<void> {
    await this.eventBus.publish("client.created", event);

    console.log(`⬆️ Client created event published: `, event);
  }
}
