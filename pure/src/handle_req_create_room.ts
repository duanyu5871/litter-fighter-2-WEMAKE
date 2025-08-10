import WebSocket from 'ws';
import { ErrCode, IReqCreateRoom, IRespCreateRoom } from '../../src/net_msg_definition';
import { room_mgr } from './RoomManager';
import { User } from './User';
import { check_no_in_room } from './check_no_in_room';
import { check_user } from './check_user';

export function handle_req_create_room(ws: WebSocket, msg: IReqCreateRoom) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  if (check_no_in_room(msg, user)) return;

  if (
    ('max_users' in msg) && (
      typeof msg.max_users !== 'number' ||
      !Number.isSafeInteger(msg.max_users) ||
      msg.max_users < 2
    )
  ) return user.error(msg, ErrCode.InvalidRoomParameters, 'max_users wrong!')

  const room = user.room = room_mgr.create_room();
  room.set_title(msg.title);
  room.set_max_users(msg.max_users)
  room.add_user(room.master = user)
  user.resp<IRespCreateRoom>(msg, { room: room.info() });
}
