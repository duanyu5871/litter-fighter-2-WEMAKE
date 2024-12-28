import { BrowserWindow, dialog } from "electron";
import { autoUpdater, ProgressInfo } from "electron-updater";
import log from "electron-log";
import { IpcChannels } from "./IpcChannels";

export class AutoUpdater {
  init(url: string) {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    autoUpdater.on("error", (error) => {
      dialog.showErrorBox(
        "Error: ",
        !error ? "unknown" : (error.stack || error).toString(),
      );
    });

    autoUpdater.on("update-available", async (info) => {
      const { response } = await dialog.showMessageBox({
        type: "info",
        title: "更新提示",
        message: "发现有新版本" + info.version + "，是否更新？",
        buttons: ["更新", "不了"],
        cancelId: 1,
      });
      response == 0 && autoUpdater.downloadUpdate();
    });

    autoUpdater.on("update-downloaded", async () => {
      const { response } = await dialog.showMessageBox({
        type: "info",
        title: "安装更新",
        buttons: ["安装", "稍后安装"],
        message: "安装包已经下载完毕，是否现在安装？",
        cancelId: 1,
      });
      response == 0 && autoUpdater.quitAndInstall();
    });
    autoUpdater.setFeedURL(url);
    return this;
  }
  bindWindow(win: BrowserWindow) {
    const listener = (info: ProgressInfo) => {
      win.webContents.send(IpcChannels.DowloadProgress, info);
      win.setProgressBar(info.percent / 100.0);
    };
    autoUpdater.on("download-progress", listener);

    win.once("close", () => {
      autoUpdater.off("download-progress", listener);
    });
  }
  checkForUpdates() {
    return autoUpdater.checkForUpdates();
  }
}
