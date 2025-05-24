import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class ListClientsByIdService {
  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private readonly redisClient: IRedisRepository
  ) {}

  async execute(): Promise<Client[]> {
    const cachedKey = "clients:all";
    const cachedClients = await this.redisClient.get(cachedKey);
    if (cachedClients) return JSON.parse(cachedClients);

    const clients = await this.clientRepository.findAll();
    this.redisClient.set(cachedKey, JSON.stringify(clients), 60 * 5);

    return clients;
  }
}
