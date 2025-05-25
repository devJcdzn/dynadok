import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { ClientCreatedProducer } from "../../../infra/messaging/producers/clientCreateProducer";
import { EventBus } from "../../../infra/messaging/eventBus";

export class CreateClientService {
  private clientCreatedProducer: ClientCreatedProducer;

  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository,
    private eventBus: EventBus
  ) {
    this.clientCreatedProducer = new ClientCreatedProducer(eventBus);
  }

  async execute({
    nome,
    email,
    telefone,
  }: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
    const client = new Client(nome, email, telefone);

    const created = await this.clientRepository.create(client);

    await this.clientCreatedProducer.publish({
      id: created.id,
      name: created.nome,
    });

    await this.redisClient.del("clients:all");

    return created;
  }
}
