import { Client } from "../../../domain/entities/Client";
import { IBaseRepository } from "../../../shared/base/baseRepository";
import { clientModel } from "./ClientModel";

export class ClientRepository implements IBaseRepository<Client> {
  async create(item: Client): Promise<void> {
    await clientModel.create(item);
  }

  async update(id: string, item: Partial<Client>): Promise<void> {
    const updated = await clientModel.findByIdAndUpdate(id, item, {
      new: true,
    });
  }

  async findById(id: string): Promise<Client> {
    const found = await clientModel.findById(id);
    return found ? found.toObject() : null;
  }

  async findAll(): Promise<Client[]> {
    const results = await clientModel.find();
    return results.map((doc: any) => doc.toObject());
  }
}
