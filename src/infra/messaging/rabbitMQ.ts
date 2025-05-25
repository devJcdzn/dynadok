import amqplib, { Channel } from "amqplib";

let connection: Awaited<ReturnType<typeof amqplib.connect>>;
let channel: Channel;

export async function connectRabbitMQ(): Promise<{
  connection: typeof connection;
  channel: Channel;
}> {
  if (channel && connection) return { connection, channel };

  connection = await amqplib.connect(
    process.env.RABBITMQ_URL || "amqp://localhost"
  );
  channel = await connection.createChannel();

  console.log("✅ RabbitMQ connected");
  return { connection, channel };
}
