import { ErrCode, IResp, MsgEnum } from './definition';
import { Room } from './Room';
import { User } from './User';

export function check_no_in_room(type: MsgEnum, user: User): Room | undefined {
  let room: Room | undefined = user.room;
  if (!room) return void 0;
  const resp: IResp = {
    type,
    code: ErrCode.AlreadyInRoom,
    error: `already in room: ${room.id}`,
  };
  user.send(resp);
  return room;
}
