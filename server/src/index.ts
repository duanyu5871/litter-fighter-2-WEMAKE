import { WebSocketServer } from 'ws';
import { Client } from './Client';
import { ClientMgr } from './ClientMgr';
import { Context } from './Context';
import { RoomMgr } from './RoomMgr';

const wss = new WebSocketServer({ port: 8080 });
const ctx = new Context(
  wss,
  new RoomMgr(),
  new ClientMgr(),
);

wss.on('connection', (ws) => new Client(ctx, ws));
wss.on('error', e => console.error('WebSocket 服务器错误:', e));
console.log('WebSocket 服务器已启动，监听端口 8080');