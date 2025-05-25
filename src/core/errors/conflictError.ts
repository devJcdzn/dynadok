import { BaseError } from "./baseError";

export class ConflictError extends BaseError {
  constructor(entity = "Recurso") {
    super("ConflictError", 409, `${entity} já existe.`);
  }
}
