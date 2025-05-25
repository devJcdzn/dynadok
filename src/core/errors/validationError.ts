import { BaseError } from "./baseError";

export class ValidationError extends BaseError {
  constructor(description: string) {
    super("ValidationError", 400, description);
  }
}