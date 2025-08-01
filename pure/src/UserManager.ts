import type WebSocket from 'ws';
import { User } from './User';

export class UserManager {
  protected _user_id: number = 1;
  protected _ws_user_map = new Map<WebSocket, User>();
  register(ws: WebSocket, name?: string): User {
    let user = this._ws_user_map.get(ws);
    if (!user) {
      const id = ++this._user_id
      user = new User(this, ws, id, name || 'player_' + id);
      this._ws_user_map.set(ws, user);
    }
    return user;
  }
  find_user(ws: WebSocket): User | undefined {
    return this._ws_user_map.get(ws)
  }
  del_user(ws: WebSocket): User | undefined {
    const user = this._ws_user_map.get(ws);
    if (!user) return void 0;
    this._ws_user_map.delete(ws);
    user.room?.del_user(user);
    return user;
  }
}
export const user_mgr = new UserManager();