
import { WebSocketServer } from 'ws';
import { MsgEnum, TReq } from '../../src/net_msg_definition';
import { handle_req_create_room } from './handle_req_create_room';
import { handle_req_exit_room } from './handle_req_exit_room';
import { handle_req_join_room } from './handle_req_join_room';
import { handle_req_player_not_ready } from './handle_req_player_not_ready';
import { handle_req_player_ready } from './handle_req_player_ready';
import { handle_req_register } from './handle_req_register';
import { handle_req_room_start } from './handle_req_room_start';
import { user_mgr } from './UserManager';

// 创建WebSocket服务器，监听8080端口
const wss = new WebSocketServer({ port: 8080 });

// 监听客户端连接事件
wss.on('connection', (ws) => {
  console.log(`新客户端连接`);

  // 监听客户端发送的消息
  ws.on('message', (data) => {
    const msg: TReq = JSON.parse(data.toString())
    console.log('收到客户端消息:', msg);
    switch (msg.type) {
      case MsgEnum.Register: handle_req_register(ws, msg); break;
      case MsgEnum.CreateRoom: handle_req_create_room(ws, msg); break;
      case MsgEnum.JoinRoom: handle_req_join_room(ws, msg); break;
      case MsgEnum.ExitRoom: handle_req_exit_room(ws, msg); break;
      case MsgEnum.RoomStart: handle_req_room_start(ws, msg); break;
      case MsgEnum.PlayerReady: handle_req_player_ready(ws, msg); break;
      case MsgEnum.PlayerNotReady: handle_req_player_not_ready(ws, msg); break;
      default: console.warn(`ignore msg type: ${msg.type}`)

    }
  });

  // 监听客户端断开连接
  ws.on('close', () => {
    console.log('客户端断开连接');
    user_mgr.del_user(ws);
  });

  // 监听错误
  ws.on('error', (err) => {
    console.error('WebSocket错误:', err);
    user_mgr.del_user(ws);
  });
});

console.log('WebSocket服务器启动，监听ws://localhost:8080');


