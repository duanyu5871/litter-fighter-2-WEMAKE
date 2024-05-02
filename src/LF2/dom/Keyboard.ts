import Callbacks, { NoEmitCallbacks } from "../base/Callbacks";

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
  readonly key: string;
  constructor(e: KeyboardEvent) {
    this.key = e.key;
  }
}

export class Keyboard {
  protected _callback = new Callbacks<IKeyboardCallback>();
  get callback(): NoEmitCallbacks<IKeyboardCallback> { return this._callback }

  protected _on_key_down = (e: KeyboardEvent) => {
    this._callback.emit('on_key_down')(new KeyEvent(e))
  }

  protected _on_key_up = (e: KeyboardEvent) => {
    this._callback.emit('on_key_up')(new KeyEvent(e))
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