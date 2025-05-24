import { BaseEntity } from "../../shared/base/baseEntity";

export class Client extends BaseEntity {
  constructor(
    public nome: string,
    public email: string,
    public telefone: string
  ) {
    super();
  }
}
