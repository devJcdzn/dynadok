export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor() {
    (this.id = crypto.randomUUID()),
      (this.createdAt = new Date()),
      (this.updatedAt = new Date());
  }
}
