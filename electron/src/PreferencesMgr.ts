import { BrowserWindow, ipcMain } from "electron";
import { IpcChannels } from "./IpcChannels";
import Preferences from "./utils/Preferences";

/**
 * 为主进程（网页进程）提供一个修改应用首选项的方式
 */
export class PreferencesMgr {
  private templates: Preferences.Template[] = [];
  constructor() {}

  bindWindow(win: BrowserWindow) {
    const listeners = {
      // 主线程请求获取“首选项模板与首选项值”
      [IpcChannels.RequestPreferences]: async () => {
        win.webContents.send(
          IpcChannels.UpdatePreferenceTemplates,
          this.templates,
        );
        const p = await Preferences.get();
        win.webContents.send(IpcChannels.UpdatePreferenceValues, p.obj);
      },

      // 主线程设置“首选项值”
      [IpcChannels.SetPreferences]: async (
        e: unknown,
        kvs?: Preferences.KeyValues,
      ) => {
        if (!kvs) return;
        const p = await Preferences.get();
        p.merge(kvs);
        win.webContents.send(IpcChannels.UpdatePreferenceValues, p.obj);
        p.commit();
      },

      // 主线程设置“移除首选项值”
      [IpcChannels.RemovePreferences]: async (e: unknown, keys?: string[]) => {
        if (!Array.isArray(keys)) return;
        const p = await Preferences.get();
        p.removes(keys);
        win.webContents.send(IpcChannels.updateRemovePreferences, keys);
        p.commit();
      },
    };

    for (const key in listeners) ipcMain.on(key, listeners[key]);

    win.once("close", () => {
      for (const key in listeners) ipcMain.removeListener(key, listeners[key]);
    });
  }
}
