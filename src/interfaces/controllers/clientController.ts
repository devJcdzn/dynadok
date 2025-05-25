import { Request, Response } from "express";
import { CreateClientService } from "../../app/services/client/createClientService";
import { UpdateClientService } from "../../app/services/client/updateClientService";
import { GetClientByIdService } from "../../app/services/client/getClientByIdService";
import { ListClientsByIdService } from "../../app/services/client/listClientsService";
import { ValidationError } from "../../core/errors/validationError";
import { DeleteClientService } from "../../app/services/client/deleteClientService";

export class ClientController {
  constructor(
    private readonly createService: CreateClientService,
    private readonly updateService: UpdateClientService,
    private readonly getByIdService: GetClientByIdService,
    private readonly listAllService: ListClientsByIdService,
    private readonly deleteService: DeleteClientService
  ) {}

  async create(request: Request, response: Response) {
    const { nome, email, telefone } = request.body as {
      nome: string;
      email: string;
      telefone: string;
    };

    if (!nome || !email || !telefone) {
      throw new ValidationError("Preencha todos os campos corretamente.");
    }

    const { id } = await this.createService.execute({ nome, email, telefone });

    return response.status(201).send({
      message: "Cliente cadastrado com sucesso.",
      client: {
        id,
      },
    });
  }

  async update(request: Request, response: Response) {
    const { nome, email, telefone } = request.body as {
      nome?: string;
      email?: string;
      telefone?: string;
    };
    const { id } = request.params;

    if (!id) {
      throw new ValidationError(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    }

    const client = await this.updateService.execute(id, {
      nome,
      email,
      telefone,
    });

    return response.send({
      message: "Cliente atualizado com sucesso.",
      client: {
        id: client.id,
      },
    });
  }

  async getById(request: Request, response: Response) {
    const { id } = request.params;

    if (!id) {
      throw new ValidationError(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    }

    const client = await this.getByIdService.execute(id);

    return response.send({
      client,
    });
  }

  async list(_request: Request, response: Response) {
    const clients = await this.listAllService.execute();

    return response.send({
      clients,
    });
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    if (!id) {
      throw new ValidationError(
        "O id do cliente deve ser enviado com parâmetro da requisicão."
      );
    }

    const client = await this.deleteService.execute(id);

    return response.send({
      message: "Cliente deletado com sucesso.",
      client: {
        id: client.id,
      },
    });
  }
}
