import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class CreateClientService {
  constructor(private readonly clientRepository: IBaseRepository<Client>) {}

  async execute({
    nome,
    email,
    telefone,
  }: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const client = new Client(nome, email, telefone);

    await this.clientRepository.create(client);
  }
}
