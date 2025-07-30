import type WebSocket from 'ws';
import { ErrCode, type IResp, type MsgEnum } from './definition';
import type { User } from './User';
import { user_mgr } from './UserManager';

export function check_user(type: MsgEnum, ws: WebSocket): User | undefined {
  const user: User | undefined = user_mgr.find_user(ws);
  if (user) return user;
  const resp: IResp = { type, code: ErrCode.NotRegister, error: 'not register yet' };
  ws.send(JSON.stringify(resp));
  return user;
}
