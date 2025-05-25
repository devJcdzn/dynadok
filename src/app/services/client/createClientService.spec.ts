import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { CreateClientService } from "./createClientService";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";

const mockRepo: IBaseRepository<Client> = {
  create: vi.fn().mockImplementation(() => Promise.resolve()),
  update: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as IRedisRepository;

describe("CreateClient Service", async () => {
  const client = {
    nome: "John Doe",
    email: "j.doe@email.com",
    telefone: "11223344556",
  };

  let clientService: CreateClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    clientService = new CreateClientService(mockRepo, mockRedis);
  });

  it("should create a client successfully", async () => {
    await clientService.execute(client);
  
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "John Doe",
        email: "j.doe@email.com",
        telefone: "11223344556",
      })
    );
  });

  it("should invalidate the clients cache after creating a new client", async () => {
    await clientService.execute(client);

    expect(mockRedis.del).toHaveBeenCalledWith("clients:all");
  });

  it("should create a client with minimum required fields", async () => {
    const minimalClient = {
      nome: "John Doe",
      email: "j.doe@email.com",
      telefone: "11223344556",
    };

    await clientService.execute(minimalClient);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining(minimalClient)
    );
  });

  it("should handle repository errors gracefully", async () => {
    const error = new Error("Database error");
    (mockRepo.create as Mock).mockRejectedValueOnce(error);

    await expect(clientService.execute(client)).rejects.toThrow("Database error");
  });

  it("should handle Redis cache invalidation errors gracefully", async () => {
    const error = new Error("Redis error");
    (mockRedis.del as Mock).mockRejectedValueOnce(error);

    await expect(clientService.execute(client)).rejects.toThrow("Redis error");
  });

  it("should create a client with special characters in name", async () => {
    const clientWithSpecialChars = {
      ...client,
      nome: "João da Silva",
    };

    await clientService.execute(clientWithSpecialChars);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "João da Silva",
      })
    );
  });

  it("should create a client with formatted phone number", async () => {
    const clientWithFormattedPhone = {
      ...client,
      telefone: "(11) 2233-4455",
    };

    await clientService.execute(clientWithFormattedPhone);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        telefone: "(11) 2233-4455",
      })
    );
  });
});
