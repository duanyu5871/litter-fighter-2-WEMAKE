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