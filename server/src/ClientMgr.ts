import type { Client } from './Client';

export class ClientMgr {
  readonly all = new Set<Client>();
}
