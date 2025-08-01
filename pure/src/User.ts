import type WebSocket from 'ws';
import type { IReq, IResp, IUserInfo } from '../../src/net_msg_definition';
import type { Room } from './Room';
import type { UserManager } from './UserManager';

export class User {
  readonly mgr: UserManager;
  readonly ws: WebSocket;
  readonly id: number;
  protected _room?: Room;
  protected _ready: boolean = false;
  get room(): Room | undefined { return this._room }
  set room(v: Room | undefined) {
    if (this._room === v) return;
    this._room = v;
    this.ready = false;
  }

  get ready(): boolean { return this._ready }
  set ready(v: boolean) { this._ready = v && !!this._room }

  name: string = '';

  constructor(mgr: UserManager, ws: WebSocket, id: number, name: string) {
    this.mgr = mgr;
    this.ws = ws;
    this.id = id;
    this.name = name;
  }
  send<T extends IResp | IReq>(msg: T): void {
    this.ws.send(JSON.stringify(msg))
  }
  resp<Resp extends IResp = IResp, Req extends IReq = IReq>(req: Req, resp?: Omit<Resp, 'type' | 'pid'>) {
    const _resp: IResp = {
      pid: req.pid,
      type: req.type,
      ...resp,
    }
    this.ws.send(JSON.stringify(_resp))
  }
  error<Resp extends IResp = IResp, Req extends IReq = IReq>(
    req: Req, code: number, error: string, resp?: Omit<Resp, 'type' | 'pid' | 'code' | 'error'>) {
    const _resp: IResp = {
      pid: req.pid,
      type: req.type,
      code,
      error,
      ...resp,
    }
    this.ws.send(JSON.stringify(_resp))
  }
  info(): Required<IUserInfo> {
    return {
      id: this.id,
      name: this.name
    }
  }
}
