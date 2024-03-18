import { TNextFrame } from '../../js_utils/lf2_type';
import { Character } from '../entity/Character';
import { IController, TKeyName } from './IController';

export const KEY_NAME_LIST = ['d', 'L', 'R', 'U', 'D', 'j', 'a'] as const;
export const CONFLICTS_KEY_MAP: Record<TKeyName, TKeyName | undefined> = {
  a: void 0,
  j: void 0,
  d: void 0,
  L: "R",
  R: "L",
  U: "D",
  D: "U",
}
export const DOUBLE_CLICK_INTERVAL = 40
export class BaseController implements IController<Character> {
  private _disposers = new Set<() => void>();
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }

  _next_punch_ready: number = 0;
  _update_count = 0;
  character: Character;
  holding: Record<TKeyName, number> = {
    L: 0,
    R: 0,
    U: 0,
    D: 0,
    a: 0,
    j: 0,
    d: 0
  };
  releases: Record<TKeyName, number> = {
    a: 0,
    d: 0,
    j: 0,
    L: 0,
    R: 0,
    U: 0,
    D: 0
  }
  release_keys(...keys: TKeyName[]): this {
    for (const k of keys) this.holding[k] = 0;
    return this;
  }
  press_keys(...keys: TKeyName[]): this {
    for (const k of keys) {
      if (this.holding[k]) continue;
      this.holding[k] = this._update_count;
      // this.double_clicks[k] = this._update_count;
    };
    return this;
  }
  is_hold(k: string): boolean;
  is_hold(k: TKeyName): boolean;
  is_hold(k: TKeyName): boolean {
    const v = this.holding[k]
    if (!v) return false;
    return !this.is_hit(k) && !!v;
  }
  is_hit(k: string): boolean;
  is_hit(k: TKeyName): boolean;
  is_hit(k: TKeyName): boolean {
    const v = this.holding[k]
    if (!v) return false;
    return this._update_count - v <= 10;
  }
  is_end(k: string): boolean;
  is_end(k: TKeyName): boolean;
  is_end(k: TKeyName): boolean {
    return !this.holding[k];
  }
  double_clicks: Record<TKeyName, number> = {
    d: 0,
    a: 0,
    j: 0,
    L: 0,
    R: 0,
    U: 0,
    D: 0
  };
  get LRUD() { return !!(this.LR1 || this.UD1); }
  get LR1(): 0 | 1 | -1 {
    const L = !!this.holding.L;
    const R = !!this.holding.R;
    return L === R ? 0 : R ? 1 : -1;
  }
  get UD1(): 0 | 1 | -1 {
    const U = !!this.holding.U;
    const D = !!this.holding.D;
    return U === D ? 0 : D ? 1 : -1;
  }
  get LR() { return this.LR1 }
  get UD() { return this.UD1 }

  private _kc_list: string | undefined = void 0;
  constructor(character: Character) {
    this.character = character;
  }

  dispose(): void {
    for (const f of this._disposers) f();
  }
  update(): TNextFrame | undefined {
    ++this._update_count;
    const k_len = KEY_NAME_LIST.length;
    const character = this.character;
    const { facing } = character;
    const frame = character.get_frame();
    const { hold, hit, state } = frame;
    let next_frame: [TNextFrame | undefined, number, TKeyName | undefined] = [void 0, 0, void 0];

    if (this.holding.d === this._update_count - 1) {
      this._kc_list = '';
    }
    if (this._kc_list !== void 0) {
      for (let i = 1; i < k_len; ++i) {
        const k = KEY_NAME_LIST[i];
        if (this.is_hit(k)) continue;
        this._kc_list += k;
      }
    }
    const hit_L = this.is_hit('L');
    const hit_R = this.is_hit('R');
    const hold_L = this.is_hold('L');
    const hold_R = this.is_hold('R');
    const end_L = this.is_end('L');
    const end_R = this.is_end('R');
    if (facing === 1) {
      if (hit?.F && hit_R && end_L && next_frame[1] < this.holding.R) next_frame = [hit.F, this.holding.R, 'R'];
      if (hit?.B && hit_L && end_R && next_frame[1] < this.holding.L) next_frame = [hit.B, this.holding.L, 'L'];
      if (hold?.F && hold_R && end_L && next_frame[1] < this.holding.R) next_frame = [hold.F, this.holding.R, 'R'];
      if (hold?.B && hold_L && end_R && next_frame[1] < this.holding.L) next_frame = [hold.B, this.holding.L, 'L'];
    } else {
      if (hit?.F && hit_L && end_R && next_frame[1] < this.holding.L) next_frame = [hit.F, this.holding.L, 'L'];
      if (hit?.B && hit_R && end_L && next_frame[1] < this.holding.R) next_frame = [hit.B, this.holding.R, 'R'];
      if (hold?.F && hold_L && end_R && next_frame[1] < this.holding.L) next_frame = [hold.F, this.holding.L, 'L'];
      if (hold?.B && hold_R && end_L && next_frame[1] < this.holding.R) next_frame = [hold.B, this.holding.R, 'R'];
    }
    for (const key of KEY_NAME_LIST) {
      const conflict_key = CONFLICTS_KEY_MAP[key];
      if (conflict_key && !this.is_end(conflict_key)) continue;
      if (hit?.[key] && this.is_hit(key) && next_frame[1] < this.holding[key])
        next_frame = [hit?.[key], this.holding[key], key];
      if (hold?.[key] && this.is_hold(key) && next_frame[1] < this.holding[key])
        next_frame = [hold?.[key], this.holding[key], key];
    }

    // if (hit?.FF && facing < 0 && this.check_double_click('L')) nf = hit.FF;
    // if (hit?.BB && facing > 0 && this.check_double_click('L')) nf = hit.BB;
    // if (hit?.BB && facing < 0 && this.check_double_click('R')) nf = hit.BB;
    // if (hit?.FF && facing > 0 && this.check_double_click('R')) nf = hit.FF;
    // if (hit?.UU && this.check_double_click('U')) nf = hit.UU;
    // if (hit?.DD && this.check_double_click('D')) nf = hit.DD;
    // if (hit?.aa && this.check_double_click('a')) nf = hit.aa;
    // if (hit?.jj && this.check_double_click('j')) nf = hit.jj;
    // if (hit?.dd && this.check_double_click('d')) nf = hit.dd;
    // switch (state) {
    //   case Defines.State.Standing:
    //   case Defines.State.Walking:
    //     for (const [, { itr }] of character.v_rests) {
    //       if (itr.kind === Defines.ItrKind.SuperPunchMe) {
    //         if (this.is_hit('a')) {
    //           nf = { id: character.data.indexes.super_punch }
    //         }
    //         break;
    //       }
    //     }
    //     break;
    // }
    // const seqs = hit?.sequences
    // if (seqs) do {
    //   let found = false;
    //   if (this.is_hit('d')) {
    //     // 同时按键的检查
    //     const strs = Object.keys(seqs)
    //     for (let i = 0; i < strs.length; ++i) {
    //       const str = strs[i];
    //       let need_continue = false;
    //       for (let j = 0; j < str.length; ++j) {
    //         if (!this.is_hit(str[j])) {
    //           need_continue = true;
    //           break;
    //         }
    //       }
    //       if (need_continue) continue;
    //       nf = seqs[str];
    //       found = true;
    //       break;
    //     }
    //   }
    //   if (found) {
    //     this._kc_list = void 0;
    //     break;
    //   }
    //   if (!this._kc_list || this._kc_list.length < 2)
    //     break;

    //   // 序列按键的检查
    //   if (seqs[this._kc_list]) {
    //     nf = seqs[this._kc_list]
    //     this._kc_list = void 0;
    //     break;
    //   }
    //   if (this._kc_list.length >= 6) {
    //     this._kc_list = void 0;
    //     break;
    //   }
    // } while (0)
    // if (next_frame[2]) this.release_keys(next_frame[2])
    return next_frame[0]
  }

  // check_double_click(k: TKeyName) {
  //   const kc = CONFLICTS_KEY_MAP[k];
  //   if (kc && this.holding[kc]) {
  //     this.double_clicks[k][0] = 0;
  //     return false;
  //   }
  //   const is_press = this.is_hit(k);
  //   const is_release = this.is_end(k);
  //   const vals = this.double_clicks[k];

  //   if (is_press && !vals[0]) {
  //     this.double_clicks[k] = [this._update_count, 0];
  //     return false;
  //   }
  //   if (is_release && !vals[1]) {
  //     if (this._update_count - vals[0] <= DOUBLE_CLICK_INTERVAL) {
  //       vals[1] = this._update_count;
  //     } else {
  //       this.double_clicks[k] = [0, 0];
  //     }
  //     return false;
  //   }
  //   if (is_press && vals[1]) {
  //     if (this._update_count - vals[1] <= DOUBLE_CLICK_INTERVAL) {
  //       const ret = this._update_count - vals[1] <= DOUBLE_CLICK_INTERVAL;
  //       this.double_clicks[k] = [0, 0];
  //       return ret;
  //     }
  //   }
  //   return false;
  // }
}
