import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.scss";
import './init';
import "./LF2/defines/defines";
import { Paths } from "./Paths";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter(Paths.Routes);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
reportWebVitals();

  const ws = new WebSocket('ws://localhost:8080');

  // 连接成功时触发
  ws.onopen = () => {
    console.log('已连接到服务器');
    ws.send('Hello, Server!'); // 向服务器发送消息
  };

  // 收到服务器消息时触发
  ws.onmessage = (event) => {
    console.log('收到服务器消息:', event.data);
  };

  // 连接关闭时触发
  ws.onclose = () => {
    console.log('与服务器的连接已关闭');
  };

  // 发生错误时触发
  ws.onerror = (err) => {
    console.error('连接错误:', err);
  };