import { Room } from './Room';

export class RoomManager {
  private _room_id = 0;
  private _id_room_map = new Map<string, Room>();
  private _rooms: Room[] = []

  get id_room_map(): ReadonlyMap<string, Room> { return this._id_room_map }
  get rooms(): Readonly<Room[]> { return this._rooms; }

  find_room(room_id: string): Room | undefined {
    return this._id_room_map.get(room_id);
  }

  create_room(): Room {
    const room = new Room(this, `room_${++this._room_id}`);
    console.log(`[RoomManager::create_room] ${JSON.stringify(room.info())}`)
    this._id_room_map.set(room.id, room);
    this._rooms.push(room);
    return room;
  }

  del_room(room_id: string) {
    console.log(`[RoomManager::del_room]`)
    const room = this._id_room_map.get(room_id)
    if (!room) {
      console.warn(`[RoomManager::del_room] room not found: ${room_id}`)
      return
    }
    room.close()
    this._id_room_map.delete(room_id)
    const idx = this._rooms.findIndex(v => v.id === room_id)
    if (idx >= 0) this._rooms.splice(idx, 1);
  }
}

export const room_mgr = new RoomManager();