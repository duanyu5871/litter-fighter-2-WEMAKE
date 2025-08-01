import WebSocket from 'ws';
import { user_mgr } from './UserManager';
import { IReqRegister, IRespRegister, MsgEnum } from '../../src/net_msg_definition';

export function handle_req_register(client: WebSocket, msg: IReqRegister) {
  const user = user_mgr.register(client, msg.name);
  user.resp<IRespRegister>(msg, { user: user.info() });
}
