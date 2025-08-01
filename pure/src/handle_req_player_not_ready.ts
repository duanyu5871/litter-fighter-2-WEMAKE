import WebSocket from 'ws';
import { IReq, IReqListRooms, IRespListRooms } from '../../src/net_msg_definition';
import { check_in_room } from './check_no_in_room';
import { check_user } from './check_user';
import { User } from './User';
import { room_mgr } from './RoomManager';


export function handle_req_player_not_ready(ws: WebSocket, msg: IReq) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  if (!check_in_room(msg, user)) return;
  user.ready = false;
  user.resp(msg)
}

export function handle_req_list_rooms(ws: WebSocket, msg: IReqListRooms) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  const { offset = 0, limit = 50 } = msg;
  const rooms = room_mgr.rooms.slice(offset, offset + limit).map(v => v.info())
  user.resp<IRespListRooms>(msg, {
    offset, limit, rooms, total: room_mgr.rooms.length
  })
}
