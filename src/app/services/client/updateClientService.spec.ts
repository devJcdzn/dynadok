import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { UpdateClientService } from "./updateClientService";
import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { EventBus } from "../../../infra/messaging/eventBus";

const mockRepo: IBaseRepository<Client> = {
  create: vi.fn(),
  update: vi.fn().mockImplementation(() => Promise.resolve()),
  findById: vi.fn(),
  findAll: vi.fn(),
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as IRedisRepository;

const mockEventBus = {
  publish: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as EventBus;

describe("UpdateClient Service", () => {
  const clientId = "client_123";
  const updateData = {
    nome: "John Updated",
    email: "john.updated@email.com",
    telefone: "11998877665",
  };

  let updateClientService: UpdateClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    updateClientService = new UpdateClientService(mockRepo, mockRedis, mockEventBus);
  });

  describe("Successful Update Scenarios", () => {
    it("should update client successfully", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, updateData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, updateData);
    });

    it("should update client with partial data", async () => {
      const partialData = { nome: "John Updated" };
      const updatedClient = {
        id: clientId,
        ...partialData,
        email: "john.updated@email.com",
        telefone: "11998877665",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, partialData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, partialData);
    });

    it("should update client with special characters in data", async () => {
      const specialData = {
        nome: "João D'Ávila",
        email: "joão.d'ávila@email.com",
        telefone: "+55 (11) 98765-4321",
      };
      const updatedClient = {
        id: clientId,
        ...specialData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, specialData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, specialData);
    });
  });

  describe("Event Publishing", () => {
    it("should publish client updated event after successful update", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, updateData);

      expect(mockEventBus.publish).toHaveBeenCalledWith("client.updated", {
        id: clientId,
        name: updateData.nome,
      });
    });

    it("should handle event publishing errors gracefully", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);
      (mockEventBus.publish as Mock).mockRejectedValueOnce(new Error("Event bus error"));

      await expect(updateClientService.execute(clientId, updateData)).rejects.toThrow("Event bus error");
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate client cache after update", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, updateData);

      expect(mockRedis.del).toHaveBeenCalledWith(`client:${clientId}`);
    });

    it("should invalidate all clients cache after update", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, updateData);

      expect(mockRedis.del).toHaveBeenCalledWith("clients:all");
    });

    it("should handle cache invalidation errors gracefully", async () => {
      const updatedClient = {
        id: clientId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);
      (mockRedis.del as Mock).mockRejectedValueOnce(new Error("Redis error"));

      await expect(updateClientService.execute(clientId, updateData)).rejects.toThrow("Redis error");
    });
  });

  describe("Error Handling", () => {
    it("should handle repository update errors gracefully", async () => {
      const error = new Error("Database error");
      (mockRepo.update as Mock).mockRejectedValueOnce(error);

      await expect(updateClientService.execute(clientId, updateData)).rejects.toThrow("Database error");
    });

    it("should handle invalid client ID", async () => {
      await expect(updateClientService.execute("", updateData)).rejects.toThrow("Client ID is required");
      await expect(updateClientService.execute(null as any, updateData)).rejects.toThrow("Client ID is required");
    });
  });

  describe("Edge Cases", () => {
    it("should handle update with minimum required fields", async () => {
      const minimalData = {
        nome: "John Updated",
      };
      const updatedClient = {
        id: clientId,
        ...minimalData,
        email: "john.updated@email.com",
        telefone: "11998877665",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, minimalData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, minimalData);
    });

    it("should handle update with maximum length fields", async () => {
      const longData = {
        nome: "A".repeat(100),
        email: "a".repeat(50) + "@email.com",
        telefone: "1".repeat(20),
      };
      const updatedClient = {
        id: clientId,
        ...longData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, longData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, longData);
    });

    it("should handle update with formatted phone number", async () => {
      const formattedData = {
        telefone: "(11) 2233-4455",
      };
      const updatedClient = {
        id: clientId,
        ...formattedData,
        nome: "John Updated",
        email: "john.updated@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockRepo.update as Mock).mockResolvedValueOnce(updatedClient);

      await updateClientService.execute(clientId, formattedData);

      expect(mockRepo.update).toHaveBeenCalledWith(clientId, formattedData);
    });
  });
});
