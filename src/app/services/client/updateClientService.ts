import { ValidationError } from "../../../core/errors/validationError";
import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { EventBus } from "../../../infra/messaging/eventBus";
import { ClientUpdatedProducer } from "../../../infra/messaging/producers/clientUpdateProducer";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class UpdateClientService {
  private clientUpdatedProducer: ClientUpdatedProducer;

  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository,
    private eventBus: EventBus
  ) {
    this.clientUpdatedProducer = new ClientUpdatedProducer(eventBus);
  }

  async execute(id: string, data: Partial<Client>): Promise<Client> {
    if (!id) {
      throw new ValidationError(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    }

    const updated = await this.clientRepository.update(id, data);

    await this.clientUpdatedProducer.publish({
      id: updated.id,
      name: updated.nome,
    });

    await this.redisClient.del(`client:${id}`);
    await this.redisClient.del(`clients:all`);

    return updated;
  }
}
