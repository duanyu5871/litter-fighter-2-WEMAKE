
import WebSocket, { WebSocketServer } from 'ws';
import { handle_req_create_room } from './handle_req_create_room';
import { handle_req_join_room } from './handle_req_join_room';
import { handle_req_register } from './handle_req_register';
import { IReqJoinRoom, IReqCreateRoom, IReqRegister, MsgEnum } from './definition';
import { user_mgr } from './UserManager';
type TReq = IReqJoinRoom | IReqCreateRoom | IReqRegister;

// 创建WebSocket服务器，监听8080端口
const wss = new WebSocketServer({ port: 8080 });

// 监听客户端连接事件
wss.on('connection', (ws) => {
  console.log(`新客户端连接`);

  // 监听客户端发送的消息
  ws.on('message', (data) => {
    const any: TReq = JSON.parse(data.toString())
    switch (any.type) {
      case MsgEnum.Register: handle_req_register(ws, any as any); break;
      case MsgEnum.CreateRoom: handle_req_create_room(ws, any as any); break;
      case MsgEnum.JoinRoom: handle_req_join_room(ws, any as any); break;
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