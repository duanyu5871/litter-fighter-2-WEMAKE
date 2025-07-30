
import WebSocket, { WebSocketServer } from 'ws';

// import { LF2 } from "../../src/LF2/LF2"
// console.log("hello");

// 创建WebSocket服务器，监听8080端口
const wss = new WebSocketServer({ port: 8080 });

// 监听客户端连接事件
wss.on('connection', (ws) => {
  console.log('新客户端连接');

  // 监听客户端发送的消息
  ws.on('message', (data) => {
    console.log(`收到客户端消息: ${data.toString()}`);

    // 向当前客户端回复消息
    ws.send(`服务器已收到: ${data.toString()}`);

    // （可选）广播消息给所有连接的客户端（包括发送者）
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`广播消息: ${data.toString()}`);
      }
    });
  });

  // 监听客户端断开连接
  ws.on('close', () => {
    console.log('客户端断开连接');
  });

  // 监听错误
  ws.on('error', (err) => {
    console.error('WebSocket错误:', err);
  });
});

console.log('WebSocket服务器启动，监听ws://localhost:8080');