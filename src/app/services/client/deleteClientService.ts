import { ValidationError } from "../../../core/errors/validationError";
import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { EventBus } from "../../../infra/messaging/eventBus";
import { ClientDeletedProducer } from "../../../infra/messaging/producers/clientDeleteProducer";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class DeleteClientService {
  private clientDeletedProducer: ClientDeletedProducer;

  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository,
    private eventBus: EventBus
  ) {
    this.clientDeletedProducer = new ClientDeletedProducer(eventBus);
  }

  async execute(id: string) {
    if (!id) {
      throw new ValidationError(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    }

    const deleted = await this.clientRepository.delete(id);

    await this.clientDeletedProducer.publish({
      id: deleted.id,
    });

    await this.redisClient.del(`client:${id}`);
    await this.redisClient.del(`clients:all`);

    return deleted
  }
}
