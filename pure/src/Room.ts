import { IResp, IRespCloseRoom, IRespOtherExitRoom, IRespOtherJoinRoom, IRoomInfo, MsgEnum } from "../../src/net_msg_definition";
import { RoomManager } from "./RoomManager";
import type { User } from "./User";
export class Room {
  protected _title: string | undefined;
  protected _max_users: number | undefined;

  readonly mgr: RoomManager;
  readonly id: string;
  private _users: User[] = []
  master?: User;

  get users(): Readonly<User[]> { return this._users; }
  get title() { return this._title; }
  get max_users() { return this._max_users; }

  constructor(mgr: RoomManager, id: string) {
    this.mgr = mgr;
    this.id = id;
  }
  set_title(title: string | undefined) {
    this._title = title
    return this
  }
  set_max_users(max_users: number | undefined) {
    this._max_users = max_users
    return this
  }
  info(): IRoomInfo {
    return {
      title: this._title,
      max_users: this._max_users,
      id: this.id,
      master: this.master?.info(),
      users: this._users.map(v => v.info())
    }
  }

  add_user(user: User) {
    console.log(`[Room::add_user]`)
    const idx = this._users.findIndex(v => user === v);
    if (idx >= 0) return;
    this.broadcast<IRespOtherJoinRoom>({ type: MsgEnum.OtherJoinRoom, player: user.info() });
    this._users.push(user)
  }

  del_user(user: User) {
    console.log(`[Room::del_user]`)
    const idx = this._users.findIndex(v => user === v);
    if (this.master === user) this.master = void 0;
    this._users.splice(idx, 1)
    this.broadcast<IRespOtherExitRoom>({ type: MsgEnum.OtherExitRoom, player: user.info() });
    if (this.users.length <= 0) this.mgr.del_room(this.id)
  }

  broadcast<T extends IResp>(msg: Omit<T, 'pid'>) {
    for (const user of this._users) {
      user.send<IResp>({ type: msg.type, pid: 'room_' + ++room_pid })
    }
  }
  close() {
    console.log(`[Room::close]`)
    this.broadcast<IRespCloseRoom>({ type: MsgEnum.CloseRoom })
    for (const user of this._users) {
      user.room = void 0;
      user.ready = false;
    }
    this.master = void 0;
    this._users.length = 0;
  }
}

let room_pid = 1
