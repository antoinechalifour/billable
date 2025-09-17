export type Client = {
  id: string;
  name: string;
};

export interface Clients {
  all(): Promise<Client[]>;
}

export class ClientsAdapter implements Clients {
  all(): Promise<Client[]> {
    return Promise.resolve([]);
  }
}
