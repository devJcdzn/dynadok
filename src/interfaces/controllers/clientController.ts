import { Request, Response } from "express";
import { CreateClientService } from "../../app/services/client/createClientService";
import { UpdateClientService } from "../../app/services/client/updateClientService";
import { GetClientByIdService } from "../../app/services/client/getClientByIdService.spec";
import { ListClientsByIdService } from "../../app/services/client/listClientsService";

export class ClientController {
  constructor(
    private readonly createService: CreateClientService,
    private readonly updateService: UpdateClientService,
    private readonly getByIdService: GetClientByIdService,
    private readonly listAllService: ListClientsByIdService
  ) {}

  async create(request: Request, response: Response) {
    const { nome, email, telefone } = request.body as {
      nome: string;
      email: string;
      telefone: string;
    };

    if (!nome || !email || !telefone) {
      return response.status(400).send({
        message: "Preencha todos os campos corretamente.",
      });
    }

    await this.createService.execute({ nome, email, telefone });

    return response.status(201).send({
      message: "Cliente cadastrado com sucesso.",
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
      return response.status(400).send({
        message: "Por favor envie o id do cliente na requisição.",
      });
    }

    await this.updateService.execute(id, { nome, email, telefone });

    return response.send({
      message: "Cliente atualizado com sucesso.",
    });
  }

  async getById(request: Request, response: Response) {
    const { id } = request.params;

    if (!id) {
      return response.status(400).send({
        message: "Por favor, envie o id do cliente nda Requisição",
      });
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
}
