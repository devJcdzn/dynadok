import { Router, Request, Response } from "express";
import { ClientRepository } from "../../infra/db/mongodb/repositories/mongoClientRepository";
import { ClientController } from "../controllers/clientController";
import { CreateClientService } from "../../app/services/client/createClientService";
import { UpdateClientService } from "../../app/services/client/updateClientService";
import { GetClientByIdService } from "../../app/services/client/getClientByIdService";
import { ListClientsByIdService } from "../../app/services/client/listClientsService";
import { RedisConfig } from "../../infra/db/redis/config";
import { EventBus } from "../../infra/messaging/eventBus";
import { DeleteClientService } from "../../app/services/client/deleteClientService";

const router = Router();

const repository = new ClientRepository();
const redisClient = new RedisConfig();
const eventBus = new EventBus();

const controller = new ClientController(
  new CreateClientService(repository, redisClient, eventBus),
  new UpdateClientService(repository, redisClient, eventBus),
  new GetClientByIdService(repository, redisClient),
  new ListClientsByIdService(repository, redisClient),
  new DeleteClientService(repository, redisClient, eventBus)
);

router.post("/clients", async (req: Request, res: Response) => {
  await controller.create(req, res);
});

router.get("/clients/:id", async (req: Request, res: Response) => {
  await controller.getById(req, res);
});

router.put("/clients/:id", async (req: Request, res: Response) => {
  await controller.update(req, res);
});

router.get("/clients", async (req: Request, res: Response) => {
  await controller.list(req, res);
});

export const clientRoutes = router;
