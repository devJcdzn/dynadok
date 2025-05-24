import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class GetClientByIdService {
  constructor(private readonly clientRepository: IBaseRepository<Client>) {}

  async execute(id: string) {
    return await this.clientRepository.findById(id);
  }
}
