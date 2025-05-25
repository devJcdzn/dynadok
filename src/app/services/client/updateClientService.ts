import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class UpdateClientService {
  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository
  ) {}

  async execute(id: string, data: Partial<Client>): Promise<void> {
    if (!id) {
      throw new Error("Client ID is required");
    }

    await this.clientRepository.update(id, data);

    await this.redisClient.del(`client:${id}`);
    await this.redisClient.del(`clients:all`);
  }
}
