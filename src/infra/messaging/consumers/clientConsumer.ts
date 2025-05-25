import { connectRabbitMQ } from "../rabbitMQ";

export async function consumeClientCreated() {
  const { channel } = await connectRabbitMQ();
  const queue = "client.created";

  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      console.log("👂 Evento de criação de cliente recebido:", data);
      channel.ack(msg);
    }
  });
}
