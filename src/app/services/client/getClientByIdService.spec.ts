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

  it("should return client from mongo if not in cache", async () => {
    mockRedis.get = vi.fn().mockResolvedValue(null);
    mockRepo.findById = vi.fn().mockResolvedValue(clientMock);

    const result = await clientService.execute("client_123");

    expect(result).toEqual(clientMock);
    expect(mockRedis.get).toHaveBeenCalledWith("client:client_123");
    expect(mockRepo.findById).toHaveBeenCalledWith("client_123");
  });
});
