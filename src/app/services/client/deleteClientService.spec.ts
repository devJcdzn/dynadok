import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { DeleteClientService } from "./deleteClientService";
import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { EventBus } from "../../../infra/messaging/eventBus";

const mockRepo: IBaseRepository<Client> = {
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn().mockImplementation(() => Promise.resolve()),
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as IRedisRepository;

const mockEventBus = {
  publish: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as EventBus;

describe("DeleteClient Service", () => {
  const clientId = "client_123";
  const deletedClient = {
    id: clientId,
    nome: "John Doe",
    email: "j.doe@email.com",
    telefone: "11223344556",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let deleteClientService: DeleteClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteClientService = new DeleteClientService(
      mockRepo,
      mockRedis,
      mockEventBus
    );
  });

  describe("Successful Deletion", () => {
    it("should delete client successfully", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      const result = await deleteClientService.execute(clientId);
      expect(mockRepo.delete).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(deletedClient);
    });
  });

  describe("Event Publishing", () => {
    it("should publish client deleted event after successful delete", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      await deleteClientService.execute(clientId);
      expect(mockEventBus.publish).toHaveBeenCalledWith("client.deleted", {
        id: clientId,
      });
    });

    it("should handle event publishing errors gracefully", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      (mockEventBus.publish as Mock).mockRejectedValueOnce(new Error("Event bus error"));
      await expect(deleteClientService.execute(clientId)).rejects.toThrow("Event bus error");
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate client cache after delete", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      await deleteClientService.execute(clientId);
      expect(mockRedis.del).toHaveBeenCalledWith(`client:${clientId}`);
    });

    it("should invalidate all clients cache after delete", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      await deleteClientService.execute(clientId);
      expect(mockRedis.del).toHaveBeenCalledWith("clients:all");
    });

    it("should handle cache invalidation errors gracefully", async () => {
      (mockRepo.delete as Mock).mockResolvedValueOnce(deletedClient);
      (mockRedis.del as Mock).mockRejectedValueOnce(new Error("Redis error"));
      await expect(deleteClientService.execute(clientId)).rejects.toThrow("Redis error");
    });
  });

  describe("Error Handling", () => {
    it("should handle repository delete errors gracefully", async () => {
      const error = new Error("Database error");
      (mockRepo.delete as Mock).mockRejectedValueOnce(error);
      await expect(deleteClientService.execute(clientId)).rejects.toThrow("Database error");
    });

    it("should handle invalid client Id", async () => {
      await expect(deleteClientService.execute("")).rejects.toThrow(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
      await expect(deleteClientService.execute(null as any)).rejects.toThrow(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle delete with minimal client data", async () => {
      const minimalClient = { id: "minimal_1" };
      (mockRepo.delete as Mock).mockResolvedValueOnce(minimalClient);
      const result = await deleteClientService.execute("minimal_1");
      expect(result).toEqual(minimalClient);
    });

    it("should handle delete with special characters in id", async () => {
      const specialId = "cl!ent_#@!$";
      const specialClient = { id: specialId };
      (mockRepo.delete as Mock).mockResolvedValueOnce(specialClient);
      const result = await deleteClientService.execute(specialId);
      expect(result).toEqual(specialClient);
    });
  });
});
