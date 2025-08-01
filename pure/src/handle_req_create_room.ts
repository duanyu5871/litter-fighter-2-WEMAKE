import WebSocket from 'ws';
import { room_mgr } from './RoomManager';
import { User } from './User';
import { check_user } from './check_user';
import { check_no_in_room } from './check_no_in_room';
import { IReqCreateRoom, MsgEnum, IRespCreateRoom } from '../../src/net_msg_definition';

export function handle_req_create_room(ws: WebSocket, msg: IReqCreateRoom) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  if (check_no_in_room(msg, user)) return;

  const room = user.room = room_mgr.create_room();
  room.users.push(room.master = user)
  user.resp<IRespCreateRoom>(msg, { room: room.info() });
}
