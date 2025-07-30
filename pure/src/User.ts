import type WebSocket from 'ws';
import type { Room } from './Room';
import type { IResp, IUserInfo } from './definition';

export class User {
  readonly ws: WebSocket;
  readonly id: number;
  name: string = '';
  room?: Room;
  constructor(ws: WebSocket, id: number, name: string) {
    this.ws = ws;
    this.id = id;
    this.name = name;
  }
  send<T extends IResp>(msg: T): void {
    this.ws.send(JSON.stringify(msg))
  }
  info(): Required<IUserInfo> {
    return {
      id: this.id,
      name: this.name
    }
  }
}
