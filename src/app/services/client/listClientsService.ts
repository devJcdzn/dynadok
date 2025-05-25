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

    try {
      const cachedClients = await this.redisClient.get(cachedKey);

      if (cachedClients) {
        try {
          const parsedClients = JSON.parse(cachedClients);
          return parsedClients.map((client: any) => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt),
          }));
        } catch (parseError: unknown) {
          console.warn(
            `Failed to parse cached clients data: ${
              parseError instanceof Error ? parseError.message : "Unknown error"
            }`
          );
        }
      }
    } catch (redisError: unknown) {
      console.warn(
        `Redis error: ${
          redisError instanceof Error ? redisError.message : "Unknown error"
        }`
      );
    }

    const clients = await this.clientRepository.findAll();

    try {
      await this.redisClient.set(cachedKey, JSON.stringify(clients), 60 * 5);
    } catch (cacheError: unknown) {
      console.warn(
        `Failed to cache clients data: ${
          cacheError instanceof Error ? cacheError.message : "Unknown error"
        }`
      );
    }

    return clients;
  }
}
