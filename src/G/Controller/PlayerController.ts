import Character from '../Character';
import BaseController, { KEY_CODE_LIST } from "./BaseController";

export default class PlayerController extends BaseController {
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
    (window as any).sss = this;
    this.kc.L = keycode_left.toLowerCase();
    this.kc.R = keycode_right.toLowerCase();
    this.kc.U = keycode_up.toLowerCase();
    this.kc.D = keycode_down.toLowerCase();
    this.kc.a = keycode_attack.toLowerCase();
    this.kc.j = keycode_jump.toLowerCase();
    this.kc.d = keycode_defense.toLowerCase();

    const on_key_up = (e: KeyboardEvent) => {
      const e_key = e.key?.toLowerCase();
      switch (e_key) {
        case this.kc.R: this.releases.R = 1; break;
        case this.kc.L: this.releases.L = 1; break;
        case this.kc.U: this.releases.U = 1; break;
        case this.kc.D: this.releases.D = 1; break;
        case this.kc.a: this.releases.a = 1; break;
        case this.kc.j: this.releases.j = 1; break;
        case this.kc.d: this.releases.d = 1; break;
      }
    };
    const on_key_down = (e: KeyboardEvent) => {
      const e_key = e.key?.toLowerCase();
      const k_len = KEY_CODE_LIST.length;
      for (let i = 0; i < k_len; ++i) {
        const k = KEY_CODE_LIST[i];
        if (e_key !== this.kc[k]) continue;
        if (this.holding[k]) return;
        this.holding[k] = 1;
        break;
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
