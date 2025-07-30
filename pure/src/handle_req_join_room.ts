import WebSocket from 'ws';
import { check_no_in_room } from './check_no_in_room';
import { check_user } from './check_user';
import { IReqJoinRoom, IResp, IRespJoinRoom, MsgEnum } from './definition';
import { room_mgr } from './RoomManager';
import { User } from './User';

export function handle_req_join_room(ws: WebSocket, msg: IReqJoinRoom) {
  const user: User | undefined = check_user(MsgEnum.JoinRoom, ws);
  if (!user || check_no_in_room(MsgEnum.JoinRoom, user)) return;

  const { roomid } = msg;
  if (!roomid) {
    user.send<IResp>({ type: MsgEnum.JoinRoom, error: `roomid can not be ${msg.roomid}` })
    return
  }
  const room = room_mgr.find_room(roomid)
  if (!room) {
    user.send<IResp>({ type: MsgEnum.JoinRoom, error: `room not found, roomid: ${msg.roomid}` })
    return
  }
  user.room = room;
  room.users.push(user)
  if (!room.master) room.master = user;

  user.send<IRespJoinRoom>({
    type: MsgEnum.JoinRoom,
    room: room.info()
  })
}
