import { connectRabbitMQ } from "../rabbitMQ";

export async function publishClientCreated(client: {
  id: string;
  name: string;
}) {
  const { channel } = await connectRabbitMQ();
  const queue = "client.created";

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(client)), {
    persistent: true,
  });

  console.log("📨 Evento de criação de cliente publicado:", client);
}
