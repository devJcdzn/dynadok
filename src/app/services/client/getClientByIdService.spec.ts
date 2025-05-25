import { describe, it, beforeEach, vi, expect } from "vitest";
import { GetClientByIdService } from "./getClientByIdService";
import { Client } from "../../../domain/entities/Client";
import Redis from "ioredis";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { IBaseRepository } from "../../../shared/base/baseRepository";

const mockRepo: IBaseRepository<Client> = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  findAll: vi.fn(),
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  sentinel: vi.fn(),
} as unknown as Redis;

describe("GetClientById Service", async () => {
  const clientMock: Client = {
    id: "client_123",
    nome: "John Doe",
    email: "j.doe@email.com",
    telefone: "11223344556",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let clientService: GetClientByIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    clientService = new GetClientByIdService(
      mockRepo,
      mockRedis as unknown as IRedisRepository
    );
  });

  describe("Cache Scenarios", () => {
    it("should return client from cache if exists", async () => {
      const stringifiedClient = JSON.stringify(clientMock);
      mockRedis.get = vi.fn().mockResolvedValue(stringifiedClient);
      const result = await clientService.execute("client_123");
      
      const expectedResult = {
        ...clientMock,
        createdAt: new Date(clientMock.createdAt),
        updatedAt: new Date(clientMock.updatedAt)
      };
      
      expect(result).toEqual(expectedResult);
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it("should handle malformed cache data gracefully", async () => {
      mockRedis.get = vi.fn().mockResolvedValue("invalid-json");
      mockRepo.findById = vi.fn().mockResolvedValue(clientMock);

      const result = await clientService.execute("client_123");

      expect(result).toEqual(clientMock);
      expect(mockRepo.findById).toHaveBeenCalledWith("client_123");
    });
  });

  describe("Database Scenarios", () => {
    it("should return client from mongo if not in cache", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockResolvedValue(clientMock);

      const result = await clientService.execute("client_123");

      expect(result).toEqual(clientMock);
      expect(mockRedis.get).toHaveBeenCalledWith("client:client_123");
      expect(mockRepo.findById).toHaveBeenCalledWith("client_123");
    });

    it("should return null when client is not found in database", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockResolvedValue(null);

      const result = await clientService.execute("non_existent_id");

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith("client:non_existent_id");
      expect(mockRepo.findById).toHaveBeenCalledWith("non_existent_id");
    });

    it("should cache the client after fetching from database", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockResolvedValue(clientMock);

      await clientService.execute("client_123");

      expect(mockRedis.set).toHaveBeenCalledWith(
        "client:client_123",
        JSON.stringify(clientMock),
        60 * 5
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle Redis connection errors gracefully", async () => {
      mockRedis.get = vi.fn().mockRejectedValue(new Error("Redis connection error"));
      mockRepo.findById = vi.fn().mockResolvedValue(clientMock);

      const result = await clientService.execute("client_123");

      expect(result).toEqual(clientMock);
      expect(mockRepo.findById).toHaveBeenCalledWith("client_123");
    });

    it("should handle database errors gracefully", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockRejectedValue(new Error("Database error"));

      await expect(clientService.execute("client_123")).rejects.toThrow("Database error");
    });

    it("should handle invalid client ID format", async () => {
      await expect(clientService.execute("")).rejects.toThrow();
      await expect(clientService.execute(null as any)).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle client with minimal data", async () => {
      const minimalClient = {
        id: "minimal_123",
        nome: "Minimal Client",
        email: "minimal@email.com",
        telefone: "1234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockResolvedValue(minimalClient);

      const result = await clientService.execute("minimal_123");

      expect(result).toEqual(minimalClient);
    });

    it("should handle client with special characters in data", async () => {
      const specialClient = {
        ...clientMock,
        nome: "João D'Ávila",
        email: "joão.d'ávila@email.com",
        telefone: "+55 (11) 98765-4321",
      };

      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findById = vi.fn().mockResolvedValue(specialClient);

      const result = await clientService.execute("client_123");

      expect(result).toEqual(specialClient);
    });
  });
});
