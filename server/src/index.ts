import { WebSocketServer } from 'ws';
import { Client } from './Client';
import { Context } from './Context';

const wss = new WebSocketServer({ port: 8080 });
const ctx = new Context();

wss.on('connection', (ws) => new Client(ctx, ws));
wss.on('error', e => console.error('WebSocket 服务器错误:', e));
console.log('WebSocket 服务器已启动，监听端口 8080');