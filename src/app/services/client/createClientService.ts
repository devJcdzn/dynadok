import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { publishClientCreated } from "../../../infra/messaging/producers/clientProducer";

export class CreateClientService {
  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository
  ) {}

  async execute({
    nome,
    email,
    telefone,
  }: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const client = new Client(nome, email, telefone);

    await this.clientRepository.create(client);

    await publishClientCreated({
      id: client.id,
      name: client.nome,
    });

    await this.redisClient.del("clients:all");
  }
}
