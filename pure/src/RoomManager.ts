import { Room } from './Room';

export class RoomManager {
  private _room_id = 1;
  private _id_room_map = new Map<number, Room>();
  find_room(room_id: number): Room | undefined {
    return this._id_room_map.get(room_id);
  }
  create_room(): Room {
    const room = new Room(++this._room_id);
    this._id_room_map.set(room.id, room);
    return room;
  }
}

export const room_mgr = new RoomManager();