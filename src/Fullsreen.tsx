import { is_fun } from './Utils/is_fun';

export default class Fullsreen {
  enabled(): boolean {
    const d = document;
    return !!(
      d.fullscreenElement ||
      (d as any).mozFullScreenElement ||
      (d as any).webkitFullscreenElement
    );
  }
  async enter(element: HTMLElement): Promise<void> {
    const d = document as any;
    if (d.mozFullScreenEnabled === false) throw new Error("FullScreen feature is disabled.");
    if (is_fun(element.requestFullscreen)) return element.requestFullscreen();
    let r = null;
    const e = element as any;
    if (is_fun(e.mozRequestFullScreen)) r = e.mozRequestFullScreen();
    else if (is_fun(e.msRequestFullscreen)) r = e.msRequestFullscreen();
    else if (is_fun(e.webkitRequestFullScreen)) r = e.webkitRequestFullScreen();
    return r ?? Promise.reject(new Error("不支持全屏"));
  }
  exit() {
    if (document.exitFullscreen) return document.exitFullscreen();
    const d = document as any;
    if (is_fun(d.msExitFullscreen)) return d.msExitFullscreen();
    if (is_fun(d.mozCancelFullScreen)) return d.mozCancelFullScreen();
    if (is_fun(d.webkitExitFullscreen)) return d.webkitExitFullscreen();
  }
}
