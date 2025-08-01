import WebSocket from 'ws';
import { ErrCode, IReqRoomStart, IResp } from '../../src/net_msg_definition';
import { check_in_room, check_is_room_master } from './check_no_in_room';
import { check_user } from './check_user';

export function handle_req_room_start(ws: WebSocket, msg: IReqRoomStart) {
  const user = check_user(msg, ws);
  if (!user) return;
  if (!check_in_room(msg, user)) return;
  if (!check_is_room_master(msg, user)) return;

  const others = user.room!.users;
  if (others.length <= 1) {
    user.send<IResp>({
      type: msg.type,
      pid: msg.pid,
      code: ErrCode.PlayersTooFew,
      error: `players are too few`,
    });
    return;
  }
  for (const other of others) {
    if (other === user) continue;
    if (!other.ready) {
      user.send<IResp>({
        type: msg.type,
        pid: msg.pid,
        code: ErrCode.PlayersNotReady,
        error: `players are not ready`,
      });
      return;
    }
  }
  user.ready = true;
  user.room!.broadcast<IResp>({ type: msg.type })

}
