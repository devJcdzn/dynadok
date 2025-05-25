import { NotFoundError } from "../../../../core/errors/notFoundError";
import { Client } from "../../../../domain/entities/Client";
import { IBaseRepository } from "../../../../shared/base/baseRepository";
import { clientModel } from "../ClientModel";

export class ClientRepository implements IBaseRepository<Client> {
  async create(item: Client): Promise<Client> {
    const client = await clientModel.create(item);
    const { _id, ...clientData } = client.toObject();
    return {
      id: _id.toString(),
      ...clientData,
    };
  }

  async update(id: string, item: Partial<Client>): Promise<Client> {
    const updated = await clientModel.findByIdAndUpdate(id, item, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundError("Cliente");
    }

    return {
      id: updated._id.toString(),
      ...updated,
    };
  }

  async findById(id: string): Promise<Client> {
    const found = await clientModel.findById(id);
    if (!found) {
      throw new NotFoundError("Cliente");
    };

    const { _id, ...clientData } = found.toObject();
    return {
      id: _id.toString(),
      ...clientData,
    };
  }

  async findAll(): Promise<Client[]> {
    const results = await clientModel.find();
    return results.map((doc: any) => doc.toObject());
  }
}
