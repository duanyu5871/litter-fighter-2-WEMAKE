import type { WebSocket } from 'ws';
import { IMsgRespMap, IPlayerInfo, IResp, MsgEnum } from "../../src/Net/index";
import { Room } from './Room';

let client_id = 0;
export class Client {
  static readonly TAG = 'Client'
  readonly id = '' + (++client_id);
  readonly ws: WebSocket;
  player_info?: Required<IPlayerInfo>;
  room?: Room;
  ready: boolean = false;
  constructor(ws: WebSocket) {
    this.ws = ws;
  }
  resp<
    T extends MsgEnum,
    Resp extends IResp = IMsgRespMap[T]
  >(type: T, pid: string, resp: Omit<Resp, 'pid' | 'type'>) {
    if (!this.ws) return Promise.reject(new Error(`[${Client.TAG}] not open`))
    const _resp: IResp = { pid, type, ...resp };
    this.ws.send(JSON.stringify(_resp));
  }
}
