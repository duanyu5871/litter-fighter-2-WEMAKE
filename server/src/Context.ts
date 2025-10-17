
import { IMsgRespMap, IResp, MsgEnum, TInfo } from "../../src/Net/index";
import { Client } from "./Client";
import { ClientMgr } from './ClientMgr';
import { RoomMgr } from './RoomMgr';

export class Context {
  readonly room_mgr = new RoomMgr();
  readonly client_mgr = new ClientMgr();

  broadcast<T extends MsgEnum, Resp extends IResp = IMsgRespMap[T]>(type: T, resp: TInfo<Resp>, ...excludes: Client[]) {
    for (const c of this.client_mgr.all)
      if (!excludes.some(v => v === c))
        c.resp(type, '', resp).catch(e => { })
  }
}
