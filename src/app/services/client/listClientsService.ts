import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";

export class ListClientsByIdService {
  constructor(private readonly clientRepository: IBaseRepository<Client>) {}

  async execute() {
    return await this.clientRepository.findAll();
  }
}
