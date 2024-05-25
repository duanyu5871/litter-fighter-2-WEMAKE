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
  constructor(key: string, times: number = 0) {
    this.key = key;
    this.times = times;
  }
}

export class Keyboard {
  protected _callback = new Callbacks<IKeyboardCallback>();
  protected _times_map = new Map<string, number>();
  get callback(): NoEmitCallbacks<IKeyboardCallback> { return this._callback }

  on_key_down(key_code: string) {
    const times = this._times_map.get(key_code) ?? -1;
    this._times_map.set(key_code, times + 1);
    this._callback.emit('on_key_down')(new KeyEvent(key_code, times + 1))
  }

  on_key_up(key_code: string) {
    this._times_map.delete(key_code);
    this._callback.emit('on_key_up')(new KeyEvent(key_code, 0))
  }

  // constructor() { Keyboard.initializer(this) }
  // dispose() { Keyboard.disposer(this) }
}