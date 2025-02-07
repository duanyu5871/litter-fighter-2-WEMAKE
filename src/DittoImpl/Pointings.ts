import Callbacks from "../LF2/base/Callbacks";
import { NoEmitCallbacks } from "../LF2/base/NoEmitCallbacks";
import { IPointings, IPointingsCallback } from "../LF2/ditto";
import { __PointingEvent } from "./__PointingEvent";

export class __Pointings implements IPointings {
  protected _callback = new Callbacks<IPointingsCallback>();
  protected _ele?: HTMLElement;
  get callback(): NoEmitCallbacks<IPointingsCallback> {
    return this._callback;
  }

  private _on_pointer_down = (e: PointerEvent) =>
    this._callback.emit("on_pointer_down")(new __PointingEvent(this._ele, e));
  private _on_pointer_up = (e: PointerEvent) =>
    this._callback.emit("on_pointer_up")(new __PointingEvent(this._ele, e));
  private _on_pointer_move = (e: PointerEvent) =>
    this._callback.emit("on_pointer_move")(new __PointingEvent(this._ele, e));
  private _on_click = (e: MouseEvent) =>
    this._callback.emit("on_click")(new __PointingEvent(this._ele, e));

  dispose() {
    this._ele?.removeEventListener("click", this._on_click);
    this._ele?.removeEventListener("pointermove", this._on_pointer_move);
    this._ele?.removeEventListener("pointerdown", this._on_pointer_down);
    this._ele?.removeEventListener("pointerup", this._on_pointer_up);
  }

  set_element(element: HTMLElement | null | undefined) {
    if (this._ele === element) return;
    this._ele?.removeEventListener("click", this._on_click);
    this._ele?.removeEventListener("pointermove", this._on_pointer_move);
    this._ele?.removeEventListener("pointerdown", this._on_pointer_down);
    this._ele?.removeEventListener("pointerup", this._on_pointer_up);
    this._ele = void 0;
    if (element) {
      this._ele = element;
      element.addEventListener("click", this._on_click);
      element.addEventListener("pointermove", this._on_pointer_move);
      element.addEventListener("pointerdown", this._on_pointer_down);
      element.addEventListener("pointerup", this._on_pointer_up);
    }

  }
}
