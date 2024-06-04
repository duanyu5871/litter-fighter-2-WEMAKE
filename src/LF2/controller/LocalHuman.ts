import { TNextFrame } from '../defines';
import { IKeyboardCallback, KeyEvent } from '../dom/Keyboard';
import Character from '../entity/Character';
import { BaseController, KeyName } from "./BaseController";
import { BotEnemyChaser } from './BotEnemyChaser';

type TKeyCodeMap = { [x in KeyName]?: string };
type TCodeKeyMap = { [x in string]?: KeyName };
export default class LocalHuman extends BaseController implements IKeyboardCallback {
  readonly is_local_human = true;
  static is = (v: any): v is LocalHuman => v?.is_local_human === true

  private _key_code_map: TKeyCodeMap = {};
  private _code_key_map: TCodeKeyMap = {};
  private _ai?: BotEnemyChaser;

  on_key_up(e: KeyEvent) {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;
    this.end(key);
  };

  on_key_down(e: KeyEvent) {
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
    for (const key of Object.keys(key_code_map) as KeyName[]) {
      const code = key_code_map[key]?.toLowerCase()
      if (!code) continue;
      this._key_code_map[key] = code;
      this._code_key_map[code] = key
    }
  };

  as_bot(): this {
    this._ai = new BotEnemyChaser(this.player_id, this.character);
    this.lf2.keyboard.callback.del(this)
    return this;
  }

  as_human(): this {
    this._ai = void 0;
    this.lf2.keyboard.callback.add(this)
    return this;
  }
  override update(): TNextFrame | undefined {
    if (this._ai) return this._ai.update()
    return super.update()
  }
}
