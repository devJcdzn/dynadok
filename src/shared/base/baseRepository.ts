export interface BaseRepository<T> {
  create(item: T): Promise<void>;
  update(id: string, item: Partial<T>): Promise<void>;
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
}
