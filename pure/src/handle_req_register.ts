import WebSocket from 'ws';
import { user_mgr } from './UserManager';
import { IReqRegister, IRespRegister, MsgEnum } from './definition';

export function handle_req_register(client: WebSocket, msg: IReqRegister) {
  const user = user_mgr.register(client, msg.name);
  user.send<IRespRegister>({ type: MsgEnum.Register, user: user.info() });
}
