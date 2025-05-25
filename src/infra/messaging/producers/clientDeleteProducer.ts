import { IEventProducer } from "../eventProducer";
import { EventBus } from "../eventBus";

export class ClientDeletedProducer implements IEventProducer<{ id: string }> {
  constructor(private eventBus: EventBus) {}

  async publish(event: { id: string }): Promise<void> {
    await this.eventBus.publish("client.deleted", event);

    console.log(`⬆️ Client deleted event published: `, event);
  }
}
