import {
  IReqCloseRoom, IReqCreateRoom,
  IReqExitRoom,
  IReqJoinRoom, IReqPlayerReady, IRespCloseRoom,
  IRespExitRoom,
  IRespJoinRoom, IRoomInfo, MsgEnum, TInfo
} from "../../src/Net/index";
import type { Client } from './Client';
import type { Context } from "./Context";

let room_id = 0;
export class Room {
  static TAG = 'Room';
  readonly id = '' + (++room_id);
  readonly ctx: Context;
  owner: Client;
  max_players: number = 4
  title: string = `ROOM_${this.id}`;
  players = new Set<Client>();
  get room_info(): Required<IRoomInfo> {
    return {
      title: this.title,
      id: this.id,
      owner: this.owner.player_info!,
      players: Array.from(this.players).map(v => ({
        ...v.player_info!,
        ready: v.ready
      })),
      max_players: this.max_players
    }
  }
  constructor(owner: Client, req: IReqCreateRoom) {
    this.ctx = owner.ctx
    this.owner = owner;
    this.title = req.title?.trim() || `${owner.player_info?.name}的房间`
    const { max_players = 4 } = req
    if (typeof max_players === 'number' && max_players >= 2)
      this.max_players = Math.floor(max_players)

    this.players.add(owner);
    owner.room = this;
    owner.resp(req.type, req.pid, { room: this.room_info })
    this.ctx.room_mgr.all.add(this)
  }

  ready(client: Client, req: IReqPlayerReady = { type: MsgEnum.PlayerReady, pid: '' }) {
    console.log(`[${Room.TAG}::ready]`)
    const { players } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    client.ready = req.ready ?? client.ready;
    for (const pl of players)
      pl.resp(MsgEnum.PlayerReady, '', { player: player_info, ready: pl.ready })
    return true;
  }

  exit(client: Client, req: IReqExitRoom = { type: MsgEnum.ExitRoom, pid: '' }) {
    console.log(`[${Room.TAG}::exit]`)
    const { players } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    client.ready = false
    delete client.room
    players.delete(client)

    const { room_info } = this;
    const resp: TInfo<IRespExitRoom> = {
      player: player_info,
      room: room_info
    }
    for (const pl of players)
      pl.resp(MsgEnum.ExitRoom, '', resp)

    client.resp(req.type, req.pid, resp)
    return true;
  }

  join(client: Client, req: IReqJoinRoom = { type: MsgEnum.JoinRoom, pid: '' }) {
    console.log(`[${Room.TAG}::join]`)
    const { players } = this;
    const { player_info, room } = client;
    if (players.has(client)) return false;
    if (!player_info) return false;
    if (room) return false;
    players.add(client);

    client.ready = false
    client.room = this;

    const { room_info } = this;
    const resp: TInfo<IRespJoinRoom> = {
      player: player_info,
      room: room_info
    }
    client.resp(req.type, req.pid, resp)

    for (const pl of players) if (pl != client)
      pl.resp(MsgEnum.JoinRoom, '', resp)
    return true;
  }

  close(client: Client, req: IReqCloseRoom = { type: MsgEnum.CloseRoom, pid: '' }) {
    console.log(`[${Room.TAG}::close]`)
    const { players } = this;
    const { player_info, room } = client;
    if (!players.has(client)) return false;
    if (!player_info) return false;
    if (room !== this) return false;

    const { room_info } = this
    const resp: TInfo<IRespCloseRoom> = {
      room: room_info
    }
    for (const pl of players)
      if (pl != client)
        pl.resp(MsgEnum.CloseRoom, '', resp)

    client.resp(req.type, req.pid, resp)
    for (const pl of players)
      delete pl.room
    players.clear()
    return true;
  }


}
