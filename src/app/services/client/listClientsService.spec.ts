import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListClientsByIdService } from "./listClientsService";
import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";

const mockRepo: IBaseRepository<Client> = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  findAll: vi.fn(),
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
} as unknown as IRedisRepository;

describe("ListClients Service", () => {
  const clientsMock: Client[] = [
    {
      id: "client_1",
      nome: "John Doe",
      email: "j.doe@email.com",
      telefone: "11223344556",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "client_2",
      nome: "Jane Smith",
      email: "jane.smith@email.com",
      telefone: "11998877665",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  let listClientsService: ListClientsByIdService;

  beforeEach(() => {
    vi.clearAllMocks();
    listClientsService = new ListClientsByIdService(mockRepo, mockRedis);
  });

  describe("Cache Scenarios", () => {
    it("should return clients from cache if exists", async () => {
      const stringifiedClients = JSON.stringify(clientsMock);
      mockRedis.get = vi.fn().mockResolvedValue(stringifiedClients);

      const result = await listClientsService.execute();

      expect(result).toEqual(clientsMock);
      expect(mockRepo.findAll).not.toHaveBeenCalled();
      expect(mockRedis.get).toHaveBeenCalledWith("clients:all");
    });

    it("should handle malformed cache data gracefully", async () => {
      mockRedis.get = vi.fn().mockResolvedValue("invalid-json");
      mockRepo.findAll = vi.fn().mockResolvedValue(clientsMock);

      const result = await listClientsService.execute();

      expect(result).toEqual(clientsMock);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });
  });

  describe("Database Scenarios", () => {
    it("should return clients from database if not in cache", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(clientsMock);

      const result = await listClientsService.execute();

      expect(result).toEqual(clientsMock);
      expect(mockRedis.get).toHaveBeenCalledWith("clients:all");
      expect(mockRepo.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no clients exist", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue([]);

      const result = await listClientsService.execute();

      expect(result).toEqual([]);
      expect(mockRedis.get).toHaveBeenCalledWith("clients:all");
      expect(mockRepo.findAll).toHaveBeenCalled();
    });

    it("should cache the clients after fetching from database", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(clientsMock);

      await listClientsService.execute();

      expect(mockRedis.set).toHaveBeenCalledWith(
        "clients:all",
        JSON.stringify(clientsMock),
        60 * 5
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle Redis connection errors gracefully", async () => {
      mockRedis.get = vi.fn().mockRejectedValue(new Error("Redis connection error"));
      mockRepo.findAll = vi.fn().mockResolvedValue(clientsMock);

      const result = await listClientsService.execute();

      expect(result).toEqual(clientsMock);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockRejectedValue(new Error("Database error"));

      await expect(listClientsService.execute()).rejects.toThrow("Database error");
    });

    it("should handle cache setting errors gracefully", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(clientsMock);
      mockRedis.set = vi.fn().mockRejectedValue(new Error("Cache error"));

      const result = await listClientsService.execute();

      expect(result).toEqual(clientsMock);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of clients", async () => {
      const largeClientsList = Array.from({ length: 1000 }, (_, index) => ({
        id: `client_${index}`,
        nome: `Client ${index}`,
        email: `client.${index}@email.com`,
        telefone: `1199999${index.toString().padStart(4, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(largeClientsList);

      const result = await listClientsService.execute();

      expect(result).toEqual(largeClientsList);
      expect(result.length).toBe(1000);
    });

    it("should handle clients with special characters", async () => {
      const specialClients = [
        {
          ...clientsMock[0],
          nome: "João D'Ávila",
          email: "joão.d'ávila@email.com",
          telefone: "+55 (11) 98765-4321",
        },
        {
          ...clientsMock[1],
          nome: "Maria José",
          email: "maria.josé@email.com",
          telefone: "+55 (11) 91234-5678",
        },
      ];

      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(specialClients);

      const result = await listClientsService.execute();

      expect(result).toEqual(specialClients);
    });

    it("should handle clients with minimal data", async () => {
      const minimalClients = [
        {
          id: "minimal_1",
          nome: "Minimal Client 1",
          email: "minimal1@email.com",
          telefone: "1234567890",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "minimal_2",
          nome: "Minimal Client 2",
          email: "minimal2@email.com",
          telefone: "0987654321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockRepo.findAll = vi.fn().mockResolvedValue(minimalClients);

      const result = await listClientsService.execute();

      expect(result).toEqual(minimalClients);
    });
  });
});

