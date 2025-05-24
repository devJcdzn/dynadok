import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class UpdateClientService {
  constructor(private readonly clientRepository: IBaseRepository<Client>) {}

  async execute(id: string, data: Partial<Client>): Promise<void> {
    await this.clientRepository.update(id, data);
  }
}
