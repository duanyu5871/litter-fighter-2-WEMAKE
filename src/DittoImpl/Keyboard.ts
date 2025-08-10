import Callbacks from "../LF2/base/Callbacks";
import { NoEmitCallbacks } from "../LF2/base/NoEmitCallbacks";
import { IKeyboard } from "../LF2/ditto/keyboard/IKeyboard";
import { IKeyboardCallback } from "../LF2/ditto/keyboard/IKeyboardCallback";
import { IKeyEvent } from "../LF2/ditto/keyboard/IKeyEvent";

class __KeyEvent implements IKeyEvent {
  readonly times: number;
  readonly key: string;
  constructor(key: string, times: number = 0) {
    this.key = key;
    this.times = times;
  }
}

export class __Keyboard implements IKeyboard {
  protected _callback = new Callbacks<IKeyboardCallback>();
  protected _times_map = new Map<string, number>();
  static TAG = '__Keyboard';
  get callback(): NoEmitCallbacks<IKeyboardCallback> {
    return this._callback;
  }

  protected _on_key_down = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || "";
    this.key_down(key_code)
  };

  protected _on_key_up = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || "";
    this.key_up(key_code)
  };
  protected key_down = (key_code: string) => {
    const times = this._times_map.get(key_code) ?? -1;
    this._times_map.set(key_code, times + 1);
    this._callback.emit("on_key_down")(new __KeyEvent(key_code, times + 1));
  };
  protected key_up = (key_code: string) => {
    this._times_map.delete(key_code);
    this._callback.emit("on_key_up")(new __KeyEvent(key_code, 0));
  };
  protected gamepads = new Map<number, Gamepad>()
  protected gamepad_buttons_timer?: ReturnType<typeof setInterval>;
  protected gamepad_buttons = new Map<string, boolean>();
  protected gamepads_timer?: ReturnType<typeof setInterval>;
  constructor() {
    window.addEventListener("keydown", this._on_key_down);
    window.addEventListener("keyup", this._on_key_up);
    this.gamepad_buttons_timer = setInterval(this.scan_gamepad_buttons.bind(this), 100 / 6)
  }

  protected scan_gamepad_buttons() {

    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (!gamepad) continue;
      console.log(gamepad.axes)
      const type = (gamepad.id.toLowerCase().indexOf('xbox') >= 0) ? 'xbox' : '';
      const { buttons, index } = gamepad;
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        const key_name = gamepad_key_map[type]?.[i] || 'Button '+i
        const key_code = `${index + 1}: ${key_name}`;
        const pressed = btn.pressed || btn.touched || btn.value >= 0.3;
        const old_status = !!this.gamepad_buttons.get(key_code);
        if (old_status === pressed) continue;
        this.gamepad_buttons.set(key_code, pressed);
        if (pressed) this.key_down(key_code);
        else this.key_up(key_code);
      }
    }
  }
  dispose() {
    window.removeEventListener("keydown", this._on_key_down);
    window.removeEventListener("keyup", this._on_key_up);
    this._callback.clear()
    clearInterval(this.gamepad_buttons_timer)
    clearInterval(this.gamepads_timer)
  }
}

const gamepad_key_map: { [x in string]?: { [x in number]?: string } } = {
  xbox: {
    0: 'A',
    1: 'B',
    2: 'X',
    3: 'Y',
    4: 'LB',
    5: 'RB',
    6: 'LT',
    7: 'RT',
    8: 'LS',
    9: 'RS',
    10: 'Back',
    11: 'Start',
    12: 'Up',
    13: 'Down',
    14: 'Left',
    15: 'Right',
    16: 'XBOX',
  }
}