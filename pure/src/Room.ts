import { IRoomInfo } from "./definition";
import type { User } from "./User";
export class Room {
  readonly id: number;
  readonly users: User[] = []
  master?: User;
  constructor(id: number) {
    this.id = id;
  }
  del_user(user: User) {
    const idx = this.users.findIndex(v => user === v);
    if (this.master === user) this.master = void 0;
    this.users.splice(idx, 1)
  }
  info(): IRoomInfo {
    return {
      id: this.id,
      master: this.master?.info(),
      users: this.users.map(v => v.info())
    }
  }
}
