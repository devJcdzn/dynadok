export interface IBaseRepository<T> {
  create(item: T): Promise<void>;
  update(id: string, item: Partial<T>): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}
