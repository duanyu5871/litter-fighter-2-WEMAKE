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
  readonly which: string;
  constructor(which: string, character: Character, kc?: Record<TKeyName, string>) {
    super(character);
    this.which = which;
    if (kc) this.set_key_codes(kc);
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
          this.press_keys(k);
          return;
        }
      }
    };
    window.addEventListener('keydown', on_key_down);
    window.addEventListener('keyup', on_key_up);
    this.disposer = [
      () => window.removeEventListener('keydown', on_key_down),
      () => window.removeEventListener('keyup', on_key_up)
    ]
  }
  set_key_codes(kc: Record<TKeyName, string>) {
    Object.keys(kc).forEach(_k => {
      const k = _k as TKeyName;
      this.kc[k] = kc[k].toLowerCase();
    })
  }
}
