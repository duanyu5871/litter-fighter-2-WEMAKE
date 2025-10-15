import { WebSocketServer, type RawData } from 'ws';
import { ErrCode, MsgEnum, TReq } from "../../src/Net/index";
import { Client } from './Client';
import { Room } from './Room';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<Client>();
const rooms = new Set<Room>()
function ensure_player_info(client: Client, req: TReq) {
  if (client.player_info) return true;
  client.resp(req.type, req.pid, {
    code: ErrCode.NotRegister,
    error: 'player info not set!'
  });
  return false;
}
function ensure_not_in_room(client: Client, req: TReq) {
  if (!client.room) return true;
  client.resp(req.type, req.pid, {
    code: ErrCode.AlreadyInRoom,
    error: 'already in room'
  });
  return false;
}
function ensure_in_room(client: Client, req: TReq) {
  if (!client.room) return true;
  client.resp(req.type, req.pid, {
    code: ErrCode.NotInRoom,
    error: 'not in room'
  });
  return false;
}
function ensure_room_owner(client: Client, req: TReq) {
  if (client.room?.owner === client) return true;
  client.resp(req.type, req.pid, {
    code: ErrCode.NotRoomOwner,
    error: 'not owner'
  });
  return false;
}
wss.on('connection', (ws) => {

  const client = new Client(ws)

  clients.add(client);
  console.log(`客户端 ${client.id} 已连接`);

  ws.on('message', (msg: RawData) => {
    try {
      const req: TReq = JSON.parse(msg.toString());
      console.log(`客户端 ${client.id} req:`, req);

      switch (req.type) {
        case MsgEnum.PlayerInfo: {
          const player_info = client.player_info = {
            id: client.id,
            name: req.name?.trim() || `玩家${client.id}`
          }
          client.resp(req.type, req.pid, { player: player_info })
          break;
        }
        case MsgEnum.CreateRoom: {
          if (
            ensure_player_info(client, req) &&
            ensure_not_in_room(client, req)
          ) rooms.add(client.room = new Room(client, req));
          break;
        }
        case MsgEnum.JoinRoom: {
          if (
            ensure_player_info(client, req) &&
            ensure_not_in_room(client, req)
          ) {
            let room: Room | null = null
            for (const r of rooms) {
              if (r.id === req.roomid) {
                room = r;
                break;
              }
            }
            if (room) room.join(client, req);
            else client.resp(
              req.type,
              req.pid,
              { code: ErrCode.RoomNotFound, error: 'room not found' })
          }
          break;
        }
        case MsgEnum.ExitRoom: {
          if (
            ensure_player_info(client, req) &&
            ensure_in_room(client, req)
          ) client.room?.exit(client, req);
          break;
        }
        case MsgEnum.PlayerReady: {
          if (
            ensure_player_info(client, req) &&
            ensure_in_room(client, req)
          ) client.room?.ready(client, req);
          break;
        }
        case MsgEnum.CloseRoom: {
          if (
            ensure_player_info(client, req) &&
            ensure_in_room(client, req) &&
            ensure_room_owner(client, req) &&
            client.room
          ) {
            client.room.close(client, req)
            rooms.delete(client.room)
          }
          break;
        }
        case MsgEnum.RoomStart: {
          if (
            ensure_player_info(client, req) &&
            ensure_in_room(client, req) &&
            ensure_room_owner(client, req)
          ) break;
          break;
        }
        case MsgEnum.ListRooms: {
          if (
            ensure_player_info(client, req)
          ) client.resp(req.type, req.pid, { rooms: Array.from(rooms).map(v => v.room_info) })
          break;
        }
      }
    } catch (error) {
      console.error('解析消息失败:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: '消息格式错误' }
      }));
    }
  });

  ws.on('close', (code, reason) => {
    clients.delete(client);
    const { room } = client
    if (room) {
      room.close(client);
      rooms.delete(room)
    }
    console.log(`客户端 ${client.id} 已断开连接 (${code} ${reason})`);
  });

  ws.on('error', e => console.error(`客户端 ${client.id} 发生错误:`, e));
});

wss.on('error', e => console.error('WebSocket 服务器错误:', e));

console.log('WebSocket 服务器已启动，监听端口 8080');