import { Character } from '../entity/Character';
import { BaseController, TKeyName } from "./BaseController";

type TKeyCodeMap = { [x in TKeyName]?: string };
type TCodeKeyMap = { [x in string]?: TKeyName };
export class PlayerController extends BaseController {
  readonly which: string;
  private _key_code_map: TKeyCodeMap = {};
  private _code_key_map: TCodeKeyMap = {};

  private _on_key_up = (e: KeyboardEvent) => {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;
    this.end(key);
  };
  private _on_key_down = (e: KeyboardEvent) => {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;

    /** 键盘长按时，_on_key_down会被重复触发，此时不应该调用start */
    if (!this.is_end(key)) return;
    this.start(key);
  };
  constructor(which: string, character: Character, kc?: TKeyCodeMap) {
    super(character);
    this.which = which;
    if (kc) this.set_key_code_map(kc);
    window.addEventListener('keydown', this._on_key_down);
    window.addEventListener('keyup', this._on_key_up);
    this.disposer = [
      () => window.removeEventListener('keydown', this._on_key_down),
      () => window.removeEventListener('keyup', this._on_key_up)
    ]
  }
  set_key_code_map(key_code_map: TKeyCodeMap) {
    this._key_code_map = {};
    this._code_key_map = {};
    for (const key of Object.keys(key_code_map) as TKeyName[]) {
      const code = key_code_map[key]?.toLowerCase()
      if (!code) continue;
      this._key_code_map[key] = code;
      this._code_key_map[code] = key
    }
  };
}
