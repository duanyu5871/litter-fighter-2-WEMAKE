import { is_false } from './js_utils/is_bool';
import { is_fun } from './js_utils/is_fun';

export default class Fullsreen {
  is_fullscreen(): boolean {
    const d = document;
    return !!(
      d.fullscreenElement ||
      (d as any).mozFullScreenElement ||
      (d as any).webkitFullscreenElement
    );
  }
  enter(element: HTMLElement): Promise<void> {
    const d = document as any;
    if (is_false(d.mozFullScreenEnabled)) return Promise.reject(new Error("全屏功能已被禁用"));
    if (is_fun(element.requestFullscreen)) return element.requestFullscreen();
    const e = element as any;
    if (is_fun(e.mozRequestFullScreen)) return e.mozRequestFullScreen();
    else if (is_fun(e.msRequestFullscreen)) return e.msRequestFullscreen();
    else if (is_fun(e.webkitRequestFullScreen)) return e.webkitRequestFullScreen();
    return Promise.reject(new Error("不支持全屏"));
  }
  exit() {
    if (is_fun(document.exitFullscreen)) return document.exitFullscreen();
    const d = document as any;
    if (is_fun(d.msExitFullscreen)) return d.msExitFullscreen();
    if (is_fun(d.mozCancelFullScreen)) return d.mozCancelFullScreen();
    if (is_fun(d.webkitExitFullscreen)) return d.webkitExitFullscreen();
  }
}
