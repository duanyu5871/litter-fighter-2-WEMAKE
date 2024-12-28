import path from "path";
import { app, BrowserWindow, globalShortcut, ipcMain, dialog } from "electron";
import os from "os";
import { ContinuousDetector } from "./utils/ContinuousDetector";
import { createDevClient } from "./dev";
import { LocalWebServer } from "./LocalWebServer";
import { AppArgs } from "./utils/AppArgs";
import Preferences from "./utils/Preferences";
import { randomStr } from "./utils/Utils";
import log from "electron-log";
import { PreferencesMgr } from "./PreferencesMgr";
import { AutoUpdater } from "./AutoUpdater";
const preferencesMgr = new PreferencesMgr();
const autoUpdater = new AutoUpdater();

const Tag = "[Main]";
type ENV = "release" | "stage" | string;
let env: ENV = AppArgs.getOr("--env", app.isPackaged ? "release" : "stage");

const randomUA = randomStr(6);

log.transports.file.level = "info";
log.info("App starting...");

let uploadUrl =
  os.platform() === "darwin"
    ? "https://download.niushibang.com/xnzx/mac/release/"
    : "https://download.niushibang.com/xnzx/win/release/";

//mac调试
if (env === `stage`) {
  uploadUrl =
    os.platform() === "darwin"
      ? "https://download.niushibang.com/xnzx/mac/develop/"
      : "https://download.niushibang.com/xnzx/win/develop/";
}
autoUpdater.init(uploadUrl);

let win: BrowserWindow | undefined = undefined;
let mainUrl: string | undefined = undefined;
let needClearWebCaches = false;
const setMainUrl = (url: string) => {
  mainUrl = url;
  checkAndLoad();
};
const setMainWin = (win_: BrowserWindow) => {
  win = win_;
  checkAndLoad();
};
const checkAndLoad = async () => {
  if (!win || !mainUrl) return;
  try {
    if (needClearWebCaches) {
      console.debug(Tag, "checkAndLoad() try to clear all web caches.");
      await clearAllWebCaches();
      console.debug(Tag, "checkAndLoad() all web caches has been cleared.");
    }
  } catch (e) {
    console.warn(Tag, 'checkAndLoad() "clearAllWebCaches" failed! err:', e);
  }
  /*
    FIXME:
      此处getUserAgent() 获得了空字符串
      导致我们请求的userAgent变得只有 randomUA
      但似乎并无其他影响？
      这是个已知的问题，可能后续更新electron即可。
      @see {https://github.com/electron/electron/pull/35069}
      -Gim
  */
  win.webContents.setUserAgent(randomUA + " " + win.webContents.getUserAgent());
  win.webContents.once("dom-ready", () => win?.show());
  win.loadURL(mainUrl);
};

const mainWebPath = path.join(
  app.isPackaged ? app.getAppPath() : process.cwd(),
  "web",
);

const localWebServer = new LocalWebServer(mainWebPath).setRandomUA(randomUA);

async function startLocalWebServer() {
  try {
    const preferences = await Preferences.get();
    const port = preferences.get("local_web_port", 0);
    const server = await localWebServer.setPort(port).start();

    const addr = server.address();
    if (typeof addr === "string" || addr === null) return;

    preferences.set("local_web_port", addr.port).commit();
    if (port && port !== addr.port) {
      console.debug(
        Tag,
        "startLocalWebServer() port changed, need remove all web caches.",
      );
      needClearWebCaches = true;
    }
    setMainUrl("http://localhost:" + addr.port);
  } catch (e) {
    console.error(Tag, "startLocalWebServer() err:", e);
  }
}
startLocalWebServer();

function mainWin() {
  const win = new BrowserWindow({
    width: 738,
    height: 420,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });
  app.isPackaged && win.setMenu(null);
  app.isPackaged || win.webContents.openDevTools();
  createDevClient(win);
  preferencesMgr.bindWindow(win);
  autoUpdater.bindWindow(win);
  return win;
}
const clearAllWebCaches = async () => {
  needClearWebCaches = false;
  await win?.webContents.session.clearHostResolverCache();
  await win?.webContents.session.clearCache();
  await win?.webContents.session.clearStorageData({ origin: "http://" });
  await win?.webContents.session.clearStorageData({ origin: "https://" });
  await win?.webContents.session.clearStorageData({ origin: mainUrl });
};
const ctrlF12Checker = new ContinuousDetector(2);
const ctrlF5Checker = new ContinuousDetector(1);
const f5Checker = new ContinuousDetector(1);
function createWindow() {
  const win = mainWin();
  setMainWin(win);
  globalShortcut.register(
    "F5",
    f5Checker.checker(() => win?.reload()),
  );
  globalShortcut.register(
    "CommandOrControl+F5",
    ctrlF5Checker.checker(async () => {
      await clearAllWebCaches();
      win?.reload();
    }),
  );
  globalShortcut.register(
    "CommandOrControl+F12",
    ctrlF12Checker.checker(() => {
      const contents = win?.webContents;
      if (!contents) return;
      contents.isDevToolsOpened()
        ? contents.closeDevTools()
        : contents.openDevTools({ mode: "undocked" });
    }),
  );

  autoUpdater.checkForUpdates();
  //支持媒体自动播放
  app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
