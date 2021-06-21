export interface LocalDB {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<boolean>;
}

interface Data {
  [key: string]: any;
}

// this implementation will incrementally evolve to become file based
export class SimpleLocalDB implements LocalDB {
  #localDir: string;
  #data: Data;

  constructor(localDir: string) {
    this.#localDir = localDir;
    this.#data = {};
  }

  get(key) {
    return Promise.resolve(this.#data[key]);
  }

  set(key, value) {
    this.#data[key] = value;
    return Promise.resolve(true);
  }
}
