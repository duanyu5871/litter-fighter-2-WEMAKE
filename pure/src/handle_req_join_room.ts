import WebSocket from 'ws';
import { check_no_in_room } from './check_no_in_room';
import { check_user } from './check_user';
import { ErrCode, IReqJoinRoom, IResp, IRespJoinRoom, MsgEnum } from '../../src/net_msg_definition';
import { room_mgr } from './RoomManager';
import { User } from './User';

export function handle_req_join_room(ws: WebSocket, msg: IReqJoinRoom) {
  const user: User | undefined = check_user(msg, ws);
  if (!user) return;
  if (check_no_in_room(msg, user)) return;

  const { roomid } = msg;
  if (!roomid) {
    user.error(msg, ErrCode.InvalidRoomId, `roomid can not be ${msg.roomid}`)
    return
  }
  const room = room_mgr.find_room(roomid)
  if (!room) {
    user.error(msg, ErrCode.RoomNotFound, `room not found, roomid: ${msg.roomid}`)
    return
  }
  user.room = room;
  room.users.push(user)
  if (!room.master) room.master = user;

  user.resp<IRespJoinRoom>(msg, { room: room.info() })
}

