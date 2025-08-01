import WebSocket from 'ws';
import { check_in_room } from './check_no_in_room';
import { check_user } from './check_user';
import { IReqExitRoom } from './IReqExitRoom';


export function handle_req_exit_room(ws: WebSocket, msg: IReqExitRoom) {
  const user = check_user(msg, ws);
  if (!user) return;
  if (!check_in_room(msg, user)) return;
  const { room } = user;
  if (room) room.del_user(user);
  user.resp(msg, {});
}