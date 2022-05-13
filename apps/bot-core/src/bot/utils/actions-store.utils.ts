import { generateId } from './number.utils';

export class ActionStore {
  private prefix: string;
  private store: Map<string, unknown>;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.store = new Map<string, unknown>();
  }

  public add(data: unknown) {
    const id = generateId();
    this.store.set(id, data);
    return `${this.prefix}_${id}`;
  }

  public get<T>(key: string): T {
    return this.store.get(key.replace(`${this.prefix}_`, '')) as T;
  }

  public delete(key: string) {
    return this.store.delete(key.replace(`${this.prefix}_`, ''));
  }

  public getActionPrefixRegExp = (): RegExp => {
    return new RegExp(`^${this.prefix}_`);
  };
}
