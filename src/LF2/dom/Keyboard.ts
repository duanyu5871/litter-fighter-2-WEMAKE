import Callbacks from "../base/Callbacks";
import NoEmitCallbacks from "../base/NoEmitCallbacks";

export interface IKeyboardCallback {
  /**
   * 键按下
   *
   * @param {KeyEvent} e
   */
  on_key_down?(e: KeyEvent): void;

  /**
   * 键抬起
   *
   * @param {KeyEvent} e
   */
  on_key_up?(e: KeyEvent): void;
}

export class KeyEvent {
  readonly times: number;
  readonly key: string;
  constructor(e: KeyboardEvent, times: number = 0) {
    this.key = e.key;
    this.times = times;
  }
}

export class Keyboard {
  protected _callback = new Callbacks<IKeyboardCallback>();
  protected _times_map = new Map<string, number>();
  get callback(): NoEmitCallbacks<IKeyboardCallback> { return this._callback }


  protected _on_key_down = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || ''
    const times = this._times_map.get(key_code) ?? -1;
    this._times_map.set(key_code, times + 1);
    this._callback.emit('on_key_down')(new KeyEvent(e, times + 1))
  }

  protected _on_key_up = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || ''
    this._times_map.delete(key_code);
    this._callback.emit('on_key_up')(new KeyEvent(e, 0))
  }

  constructor() {
    window.addEventListener('keydown', this._on_key_down);
    window.addEventListener('keyup', this._on_key_up);
  }

  dispose() {
    window.removeEventListener('keydown', this._on_key_down)
    window.removeEventListener('keyup', this._on_key_up)
  }
}