import { IReqCloseRoom, IReqCreateRoom, IReqJoinRoom, IReqPlayerReady, IRoomInfo, MsgEnum } from "../../src/Net/index";
import { Client } from './Client';
import { IReqExitRoom } from "./IMsg_ExitRoom";


let room_id = 0;
export class Room {
  readonly id = '' + (++room_id);
  owner: Client;
  max_players: number = 4
  title: string = `ROOM_${this.id}`;
  players = new Set<Client>();
  get room_info(): Required<IRoomInfo> {
    return {
      title: this.title,
      id: this.id,
      owner: this.owner.player_info!,
      players: Array.from(this.players).map(v => v.player_info!),
      max_players: this.max_players
    }
  }
  constructor(owner: Client, req: IReqCreateRoom) {
    this.owner = owner;
    this.title = req.title?.trim() || `${owner.player_info?.name}的房间`
    const { max_players = 4 } = req
    if (typeof max_players === 'number' && max_players >= 2)
      this.max_players = Math.floor(max_players)

    this.players.add(owner);
    owner.room = this;
    owner.resp(req.type, req.pid, { room: this.room_info })
  }

  ready(client: Client, req?: IReqPlayerReady) {
    const { players } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    client.ready = !!req?.ready;
    for (const pl of players)
      pl.resp(MsgEnum.PlayerReady, '', { player: player_info, ready: true })
    client.resp(
      req?.type ?? MsgEnum.PlayerReady,
      req?.pid ?? '',
      { player: player_info, ready: true }
    )
    return true;
  }

  exit(client: Client, req?: IReqExitRoom) {
    const { players, room_info } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    if (req) players.delete(client);
    for (const pl of players)
      pl.resp(MsgEnum.ExitRoom, '', { player: player_info, room: room_info })
    client.ready = false
    delete client.room
    client.resp(
      req?.type ?? MsgEnum.ExitRoom,
      req?.pid ?? '',
      { player: player_info, room: room_info }
    )
    return true;
  }

  join(client: Client, req?: IReqJoinRoom) {
    const { players, room_info } = this;
    const { player_info, room } = client;
    if (players.has(client)) return false;
    if (!player_info) return false;
    if (room) return false;
    players.add(client);

    client.ready = false
    client.room = this;
    for (const pl of players) if (pl != client)
      pl.resp(MsgEnum.JoinRoom, '', { player: player_info, room: room_info })
    client.resp(
      req?.type ?? MsgEnum.JoinRoom,
      req?.pid ?? '',
      { player: player_info, room: room_info }
    )
    return true;
  }

  close(client: Client, req?: IReqCloseRoom) {
    const { players } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    for (const pl of players) if (pl != client) {
      pl.resp(MsgEnum.CloseRoom, '', {})
      delete client.room
    }

    delete client.room
    client.resp(
      req?.type ?? MsgEnum.CloseRoom,
      req?.pid ?? '',
      {}
    )
    players.clear()
    return true;
  }


}
