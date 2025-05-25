export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly name: string;
  public readonly description: string;

  constructor(name: string, statusCode: number, description: string) {
    super(description);
    this.name = name;
    this.statusCode = statusCode;
    this.description = description;
    Error.captureStackTrace(this, this.constructor);
  }
}
