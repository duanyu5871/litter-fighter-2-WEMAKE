import { app, BrowserWindow } from "electron";
import { client } from "electron-connect";
export const createDevClient = (win: BrowserWindow) => {
  app.isPackaged || client.create(win);
};
