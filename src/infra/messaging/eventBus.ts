import amqplib, { Channel } from "amqplib";

export class EventBus {
  private connection?: Awaited<ReturnType<typeof amqplib.connect>>;
  private channel?: Channel;

  async connect(url = process.env.RABBITMQ_URL || "amqp://localhost") {
    if (this.channel) return this.channel;

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    return this.channel;
  }

  async publish(queue: string, event: any) {
    if (!this.channel) await this.connect();
    await this.channel!.assertQueue(queue, { durable: true });
    this.channel!.sendToQueue(queue, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
  }
}
