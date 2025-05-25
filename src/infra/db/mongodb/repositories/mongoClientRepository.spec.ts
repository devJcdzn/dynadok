// tests/integration/repositories/ClientRepository.spec.ts
import { describe, beforeAll, afterAll, afterEach, it, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ClientRepository } from "./mongoClientRepository";
import { clientModel } from "../ClientModel";
import { Client } from "../../../../domain/entities/Client";

describe("ClientRepository", () => {
  let mongoServer: MongoMemoryServer;
  const repository = new ClientRepository();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await clientModel.deleteMany({});
  });

  it("should create a client", async () => {
    const client = new Client("John Doe", "j.doe@example.com", "1234567890");

    await repository.create(client);
    const created = await clientModel.findOne({ email: client.email });
    expect(created).toBeDefined();
    expect(created?.nome).toBe(client.nome);
  });

  it("should update a client", async () => {
    const client = new Client("Name", "old@example.com", "0000000000");
    await repository.create(client);

    const found = await clientModel.findOne({ email: client.email });
    expect(found).toBeDefined();
    if (!found) throw new Error("Client not found");

    await repository.update(found._id.toString(), {
      nome: "New Name",
    });

    const updated = await clientModel.findById(found._id);
    expect(updated?.nome).toBe("New Name");
  });

  it("should find client by id", async () => {
    const client = new Client("Find", "find@example.com", "9999999999");
    await repository.create(client);

    const found = await clientModel.findOne({ email: client.email });
    expect(found).toBeDefined();
    if (!found) throw new Error("Client not found");

    const retrieved = await repository.findById(found._id.toString());
    expect(retrieved?.email).toBe("find@example.com");
  });

  it("should return all clients", async () => {
    const client1 = new Client("Client One", "one@example.com", "1111111111");
    const client2 = new Client("Client Two", "two@example.com", "2222222222");

    await repository.create(client1);
    await repository.create(client2);

    const all = await repository.findAll();
    expect(all).toHaveLength(2);
  });

  it("should delete a client by id", async () => {
    const client = new Client("Delete Me", "delete@example.com", "8888888888");

    await repository.create(client);

    const found = await clientModel.findOne({ email: client.email });
    expect(found).toBeDefined();
    if (!found) throw new Error("Client not found");

    const deletedId = await repository.delete(found._id.toString());

    expect(deletedId).toBe(found._id.toString());

    const check = await clientModel.findById(deletedId);
    expect(check).toBeNull();
  });
});
