import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class GetClientByIdService {
  constructor(
    private readonly clientRepository: IBaseRepository<Client>,
    private redisClient: IRedisRepository
  ) {}

  async execute(id: string): Promise<Client | null> {
    if (!id) {
      throw new Error("Client ID is required");
    }

    const cachedKey = `client:${id}`;

    try {
      const cachedClient = await this.redisClient.get(cachedKey);

      if (cachedClient) {
        try {
          const parsed = JSON.parse(cachedClient);
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
          };
        } catch (parseError: unknown) {
          console.warn(
            `Failed to parse cached client data: ${
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

    const client = await this.clientRepository.findById(id);

    if (client) {
      try {
        await this.redisClient.set(cachedKey, JSON.stringify(client), 60 * 5);
      } catch (cacheError: unknown) {
        console.warn(
          `Failed to cache client data: ${
            cacheError instanceof Error ? cacheError.message : "Unknown error"
          }`
        );
      }
    }

    return client;
  }
}
