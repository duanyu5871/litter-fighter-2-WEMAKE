import { Room } from './Room';

export class RoomManager {

  private _room_id = 0;
  private _id_room_map = new Map<string, Room>();

  find_room(room_id: string): Room | undefined {
    return this._id_room_map.get(room_id);
  }
  
  create_room(): Room {
    const room = new Room(this, `room_${++this._room_id}`);
    console.log(`[RoomManager::create_room] ${JSON.stringify(room.info())}`)
    this._id_room_map.set(room.id, room);
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
  }
}

export const room_mgr = new RoomManager();