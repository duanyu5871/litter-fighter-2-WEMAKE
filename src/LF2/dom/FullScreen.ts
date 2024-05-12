import { is_false } from '../../common/type_check/is_bool';
import { is_fun } from '../../common/type_check/is_fun';
import Callbacks from '../base/Callbacks';
import NoEmitCallbacks from "../base/NoEmitCallbacks";
export interface IFullScreenCallback {
  onChange?(element: Element | null): void
}
export default class FullScreen {
  protected _callbacks = new Callbacks<IFullScreenCallback>();
  protected _prev_element: Element | null;

  get callbacks(): NoEmitCallbacks<IFullScreenCallback> {
    return this._callbacks;
  }

  constructor() {
    document.addEventListener('fullscreenchange', this.on_fullscreenchange)
    this._prev_element = this.element
  }

  depose(): void {
    document.removeEventListener('fullscreenchange', this.on_fullscreenchange);
  }
  
  private on_fullscreenchange = () => {
    const curr_element = this.element
    if (this._prev_element === curr_element) return;

    this._prev_element = curr_element;
    this._callbacks.emit('onChange')(curr_element);
  }

  get element(): Element | null {
    const d = document;
    return (
      d.fullscreenElement ||
      (d as any).mozFullScreenElement ||
      (d as any).webkitFullscreenElement
    )
  }
  set element(v: Element | null) {
    if (!v) this.exit();
    else this.enter(v);
  }
  get is_fullscreen(): boolean {
    return !!this.element;
  }
  enter(element: Element): Promise<void> {
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
