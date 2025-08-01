import { ErrCode, IReq, IResp } from '../../src/net_msg_definition';
import { Room } from './Room';
import { User } from './User';

export function check_no_in_room(msg: IReq, user: User): Room | undefined {
  let room: Room | undefined = user.room;
  if (!room) return void 0;
  user.error(msg, ErrCode.AlreadyInRoom, `already in room: ${room.id}`);
  return room;
}

export function check_in_room(msg: IReq, user: User): boolean {
  if (user.room) return true;
  user.error(msg, ErrCode.NotInRoom, `not in room`);
  return false;
}
export function check_is_room_master(msg: IReq, user: User): boolean {
  if (user.room?.master?.id !== user.id) {
    return true;
  }
  user.error(msg, ErrCode.NotRoomMaster, `you are not room master`);
  return false;
}
