import { BaseError } from "./baseError";

export class NotFoundError extends BaseError {
  constructor(entity = "Recurso") {
    super("NotFoundError", 404, `${entity} não encontrado.`);
  }
}
