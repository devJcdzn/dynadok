import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class GetClientByIdService {
  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private redisClient: IRedisRepository
  ) {}

  async execute(id: string): Promise<Client> {
    const cachedKey = `client:${id}`;
    const cachedClient = await this.redisClient.get(cachedKey);

    if (cachedClient) return JSON.parse(cachedClient);

    const client = await this.clientRepository.findById(id);

    await this.redisClient.set(cachedKey, JSON.stringify(client), 60 * 5);

    return client;
  }
}
