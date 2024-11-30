import GameKey from '../defines/GameKey';
import { IKeyboardCallback } from "../ditto/keyboard/IKeyboardCallback";
import { IKeyEvent } from '../ditto/keyboard/IKeyEvent';
import Character from '../entity/Character';
import { BaseController } from "./BaseController";

type TKeyCodeMap = { [x in GameKey]?: string };
type TCodeKeyMap = { [x in string]?: GameKey };
export default class LocalController extends BaseController implements IKeyboardCallback {
  readonly is_local_controller = true;
  static is = (v: any): v is LocalController => v?.is_local_controller === true

  private _key_code_map: TKeyCodeMap = {};
  private _code_key_map: TCodeKeyMap = {};
  on_key_up(e: IKeyEvent) {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;
    this.end(key);
  };

  on_key_down(e: IKeyEvent) {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;

    /** 键盘长按时，_on_key_down会被重复触发，此时不应该调用start */
    if (!this.is_end(key)) return;
    this.start(key);
  };

  constructor(player_id: string, character: Character, kc?: TKeyCodeMap) {
    super(player_id, character);
    if (kc) this.set_key_code_map(kc);
    this.disposer = character.world.lf2.keyboard.callback.add(this)
  }

  set_key_code_map(key_code_map: TKeyCodeMap) {
    this._key_code_map = {};
    this._code_key_map = {};
    for (const key of Object.keys(key_code_map) as GameKey[]) {
      const code = key_code_map[key]?.toLowerCase()
      if (!code) continue;
      this._key_code_map[key] = code;
      this._code_key_map[code] = key
    }
  };

  as_bot(): this {
    return this;
  }

  as_human(): this {
    return this;
  }

}
