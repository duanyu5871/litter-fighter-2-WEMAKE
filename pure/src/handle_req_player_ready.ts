import WebSocket from 'ws';
import { check_in_room } from './check_no_in_room';
import { check_user } from './check_user';
import { IReq, MsgEnum } from '../../src/net_msg_definition';
import { User } from './User';


export function handle_req_player_ready(ws: WebSocket, msg: IReq) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  if (!check_in_room(msg, user)) return;
  user.ready = true;

}
