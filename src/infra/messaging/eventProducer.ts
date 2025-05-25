export interface IEventProducer<T = any> {
    publish(event: T): Promise<void>;
  }