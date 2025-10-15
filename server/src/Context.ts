import { ClientMgr } from './ClientMgr';
import { RoomMgr } from './RoomMgr';

export class Context {
  readonly room_mgr = new RoomMgr();
  readonly client_mgr = new ClientMgr();
}
