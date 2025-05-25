export interface IBaseRepository<T> {
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  delete(id: string): Promise<T>;
}
