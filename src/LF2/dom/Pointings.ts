import Callbacks from "../base/Callbacks";
import NoEmitCallbacks from "../base/NoEmitCallbacks";

export interface IPointingsCallback {
  on_pointer_down?(e: PointingEvent): void;
  on_pointer_move?(e: PointingEvent): void;
  on_pointer_up?(e: PointingEvent): void;
  on_click?(e: PointingEvent): void;
}

export class PointingEvent {
  protected _element: HTMLElement;
  readonly x: number;
  readonly y: number;
  readonly scene_x: number;
  readonly scene_y: number;
  constructor(element: HTMLElement, event: PointerEvent | MouseEvent) {
    this._element = element;
    this.x = event.offsetX;
    this.y = event.offsetY;
    const { width, height } = element.getBoundingClientRect();
    this.scene_x = (this.x / width) * 2 - 1;
    this.scene_y = -(this.y / height) * 2 + 1;
  }
}

export default class Pointings {
  protected _callback = new Callbacks<IPointingsCallback>();
  protected _ele: HTMLElement;
  get callback(): NoEmitCallbacks<IPointingsCallback> { return this._callback }

  private _on_pointer_down = (e: PointerEvent) =>
    this._callback.emit('on_pointer_down')(new PointingEvent(this._ele, e))
  private _on_pointer_up = (e: PointerEvent) =>
    this._callback.emit('on_pointer_up')(new PointingEvent(this._ele, e))
  private _on_pointer_move = (e: PointerEvent) =>
    this._callback.emit('on_pointer_move')(new PointingEvent(this._ele, e))
  private _on_click = (e: MouseEvent) =>
    this._callback.emit('on_click')(new PointingEvent(this._ele, e))


  constructor(element: HTMLElement) {
    this._ele = element;
    element.addEventListener('click', this._on_click);
    element.addEventListener('pointermove', this._on_pointer_move);
    element.addEventListener('pointerdown', this._on_pointer_down);
    element.addEventListener('pointerup', this._on_pointer_up);
  }
  dispose() {
    this._ele.removeEventListener('click', this._on_click);
    this._ele.removeEventListener('pointermove', this._on_pointer_move);
    this._ele.removeEventListener('pointerdown', this._on_pointer_down);
    this._ele.removeEventListener('pointerup', this._on_pointer_up);
  }
}