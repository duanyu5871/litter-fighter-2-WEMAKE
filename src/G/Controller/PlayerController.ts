import { Character } from '../entity/Character';
import { BaseController, KEY_NAME_LIST } from "./BaseController";
import { TKeyName } from './IController';

export class PlayerController extends BaseController {
  kc: Record<TKeyName, string> = {
    L: 'a',
    R: 'd',
    U: 'w',
    D: 's',
    a: 'j',
    j: 'k',
    d: 'l',
  }
  _disposers: (() => void)[] = [];
  constructor(
    character: Character,
    keycode_left = 'a',
    keycode_right = 'd',
    keycode_up = 'w',
    keycode_down = 's',
    keycode_attack = 'j',
    keycode_jump = 'k',
    keycode_defense = 'l'
  ) {
    super(character);
    this.kc.L = keycode_left.toLowerCase();
    this.kc.R = keycode_right.toLowerCase();
    this.kc.U = keycode_up.toLowerCase();
    this.kc.D = keycode_down.toLowerCase();
    this.kc.a = keycode_attack.toLowerCase();
    this.kc.j = keycode_jump.toLowerCase();
    this.kc.d = keycode_defense.toLowerCase();

    const on_key_up = (e: KeyboardEvent) => {
      const e_key = e.key?.toLowerCase();
      const k_len = KEY_NAME_LIST.length;
      for (let i = 0; i < k_len; ++i) {
        const k = KEY_NAME_LIST[i];
        if (this.kc[k] === e_key) {
          this.release_keys(k);
          return;
        }
      }
    };
    const on_key_down = (e: KeyboardEvent) => {
      const e_key = e.key?.toLowerCase();
      const k_len = KEY_NAME_LIST.length;
      for (let i = 0; i < k_len; ++i) {
        const k = KEY_NAME_LIST[i];
        if (e_key === this.kc[k]) {
          this.press_keys(k)
          return;
        }
      }
    };
    window.addEventListener('keydown', on_key_down);
    window.addEventListener('keyup', on_key_up);
    this._disposers.push(
      () => window.removeEventListener('keydown', on_key_down),
      () => window.removeEventListener('keyup', on_key_up)
    );
  }
  dispose() {
    this._disposers.forEach(f => f());
  }
}
