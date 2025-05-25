import { IEventProducer } from "../eventProducer";
import { EventBus } from "../eventBus";

export class ClientUpdatedProducer
  implements IEventProducer<{ id: string; name: string }>
{
  constructor(private eventBus: EventBus) {}

  async publish(event: { id: string; name: string }): Promise<void> {
    await this.eventBus.publish("client.updated", event);

    console.log(`⬆️ Client updated event published: `, event);
  }
}
