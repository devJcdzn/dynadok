import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { CreateClientService } from "./createClientService";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { Client } from "../../../domain/entities/Client";
import { IRedisRepository } from "../../../domain/repositories/redisRepository";
import { EventBus } from "../../../infra/messaging/eventBus";

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

const mockEventBus = {
  publish: vi.fn().mockImplementation(() => Promise.resolve()),
} as unknown as EventBus;

describe("CreateClient Service", async () => {
  const client = {
    nome: "John Doe",
    email: "j.doe@email.com",
    telefone: "11223344556",
  };

  let clientService: CreateClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    clientService = new CreateClientService(mockRepo, mockRedis, mockEventBus);
  });

  it("should create a client successfully", async () => {
    const createdClient = {
      id: "123",
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

    await clientService.execute(client);
  
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "John Doe",
        email: "j.doe@email.com",
        telefone: "11223344556",
      })
    );
  });

  it("should publish client created event", async () => {
    const createdClient = {
      id: "123",
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

    await clientService.execute(client);

    expect(mockEventBus.publish).toHaveBeenCalledWith("client.created", {
      id: "123",
      name: "John Doe",
    });
  });

  it("should invalidate the clients cache after creating a new client", async () => {
    const createdClient = {
      id: "123",
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

    await clientService.execute(client);

    expect(mockRedis.del).toHaveBeenCalledWith("clients:all");
  });

  it("should create a client with minimum required fields", async () => {
    const minimalClient = {
      nome: "John Doe",
      email: "j.doe@email.com",
      telefone: "11223344556",
    };
    const createdClient = {
      id: "123",
      ...minimalClient,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

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
    const createdClient = {
      id: "123",
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);
    const error = new Error("Redis error");
    (mockRedis.del as Mock).mockRejectedValueOnce(error);

    await expect(clientService.execute(client)).rejects.toThrow("Redis error");
  });

  it("should handle event publishing errors gracefully", async () => {
    const createdClient = {
      id: "123",
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);
    const error = new Error("Event publishing error");
    (mockEventBus.publish as Mock).mockRejectedValueOnce(error);

    await expect(clientService.execute(client)).rejects.toThrow("Event publishing error");
  });

  it("should create a client with special characters in name", async () => {
    const clientWithSpecialChars = {
      ...client,
      nome: "João da Silva",
    };
    const createdClient = {
      id: "123",
      ...clientWithSpecialChars,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

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
    const createdClient = {
      id: "123",
      ...clientWithFormattedPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.create as Mock).mockResolvedValueOnce(createdClient);

    await clientService.execute(clientWithFormattedPhone);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        telefone: "(11) 2233-4455",
      })
    );
  });
});
