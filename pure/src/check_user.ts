import type WebSocket from 'ws';
import { ErrCode, IReq, type IResp } from '../../src/net_msg_definition';
import type { User } from './User';
import { user_mgr } from './UserManager';

export function check_user(msg: IReq, ws: WebSocket): User | undefined {
  const user: User | undefined = user_mgr.find_user(ws);
  if (user) return user;
  const resp: IResp = {
    type: msg.type,
    pid: msg.pid,
    code: ErrCode.NotRegister,
    error: 'not register yet'
  };
  ws.send(JSON.stringify(resp));
  return user;
}
