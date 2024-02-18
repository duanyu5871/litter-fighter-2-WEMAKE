import Character from '../Character';

export const KEY_CODE_LIST = ['d', 'L', 'R', 'U', 'D', 'j', 'a'] as const;
export const CONFLICTS_KEY_CODE_LIST: Record<TKeyName, TKeyName | undefined> = {
  a: void 0,
  j: void 0,
  d: void 0,
  L: "R",
  R: "L",
  U: "D",
  D: "U",
}
export const DOUBLE_CLICK_INTERVAL = 40
export default class BaseController implements IController<Character> {
  _need_punch: number = 0;
  _next_punch_ready: number = 0;
  _update_count = 0;
  character: Character;
  holding: Record<TKeyName, 0 | 1 | 2> = {
    L: 0,
    R: 0,
    U: 0,
    D: 0,
    a: 0,
    j: 0,
    d: 0
  };
  releases: Record<TKeyName, 0 | 1> = {
    a: 0,
    d: 0,
    j: 0,
    L: 0,
    R: 0,
    U: 0,
    D: 0
  }
  double_clicks: Record<TKeyName, number[] | undefined> = {
    d: undefined,
    a: undefined,
    j: undefined,
    L: undefined,
    R: undefined,
    U: undefined,
    D: undefined
  };
  get LR() { return (this.holding.R - this.holding.L) as 0 | 1 | 2 | -1 | -2; }
  get UD() { return (this.holding.D - this.holding.U) as 0 | 1 | 2 | -1 | -2; }
  get LRUD() { return !!(this.LR || this.UD); }
  get LR1(): 0 | 1 | -1 { const v = this.LR; return v > 0 ? 1 : v < 0 ? -1 : 0; }
  get UD1(): 0 | 1 | -1 { const v = this.UD; return v > 0 ? 1 : v < 0 ? -1 : 0; }

  private _kc_list: string | undefined = void 0;
  constructor(character: Character) {
    this.character = character;
  }
  dispose(): void { }
  update(): TNextFrame | undefined {
    const k_len = KEY_CODE_LIST.length;
    this._update_count++;
    const { hold, hit, state } = this.character.get_frame();
    const { face } = this.character;
    let nf: TNextFrame | undefined;
    if (this.holding.d === 1) {
      this._kc_list = '';
    }
    if (this._kc_list !== void 0) {
      for (let i = 1; i < k_len; ++i) {
        const k = KEY_CODE_LIST[i];
        if (this.holding[k] !== 1) continue;
        this._kc_list += k;
      }
    }
    switch (this.LR * face) {
      case 1: if (hit?.F) nf = hit.F; break;
      case -1: if (hit?.B) nf = hit.B; break;
      case 2: if (hold?.F) nf = hold.F; break;
      case -2: if (hold?.B) nf = hold.B; break;
    }
    for (let i = 0; i < k_len; ++i) {
      const k = KEY_CODE_LIST[i];
      const ck = CONFLICTS_KEY_CODE_LIST[k];
      if (ck && this.holding[ck]) continue;
      if (this.holding[k] === 1 && hit?.[k]) { nf = hit[k]; break; }
      if (this.holding[k] === 2 && hold?.[k]) { nf = hold[k]; break; }
    }
    if (hit?.FF && face < 0 && this.check_double_click('L')) nf = hit.FF;
    if (hit?.BB && face > 0 && this.check_double_click('L')) nf = hit.BB;
    if (hit?.BB && face < 0 && this.check_double_click('R')) nf = hit.BB;
    if (hit?.FF && face > 0 && this.check_double_click('R')) nf = hit.FF;
    if (hit?.UU && this.check_double_click('U')) nf = hit.UU;
    if (hit?.DD && this.check_double_click('D')) nf = hit.DD;
    if (hit?.aa && this.check_double_click('a')) nf = hit.aa;
    if (hit?.jj && this.check_double_click('j')) nf = hit.jj;
    if (hit?.dd && this.check_double_click('d')) nf = hit.dd;


    switch (state) {
      case 3: {
        if (this.holding.a === 1 && this._next_punch_ready)
          this._need_punch = 1
        break;
      }
    }
    const seqs = hit?.sequences
    if (seqs) do {
      let found = false;
      if (this.holding.d) {
        // 同时按键的检查
        const strs = Object.keys(seqs)
        for (let i = 0; i < strs.length; ++i) {
          const str = strs[i];
          let total = this.holding.d;
          let need_continue = false;
          for (let j = 0; j < str.length; ++j) {
            const v = (this.holding as any)[str[j]];
            if (v) { need_continue = true; break; }
            total += v;
          }
          if (need_continue) continue;
          if (total === str.length + 1) {
            nf = seqs[str];
            found = true;
            break;
          }
        }
      }
      if (found) {
        this._kc_list = void 0;
        break;
      }
      if (!this._kc_list || this._kc_list.length < 2)
        break;

      // 序列按键的检查
      if (seqs[this._kc_list]) {
        nf = seqs[this._kc_list]
        this._kc_list = void 0;
        break;
      }
      if (this._kc_list.length >= 6) {
        this._kc_list = void 0;
        break;
      }
    } while (0)

    for (let i = 0; i < k_len; ++i) {
      const k = KEY_CODE_LIST[i];
      if (this.holding[k] === 1) this.holding[k] = 2
      if (this.releases[k] === 1) { this.releases[k] = this.holding[k] = 0 }
    }
    return nf
  }

  check_double_click(target: TKeyName) {
    const kc = CONFLICTS_KEY_CODE_LIST[target];
    if (kc && this.holding[kc]) {
      this.double_clicks[target] = void 0;
      return false;
    }
    const h = this.holding[target];
    const a = this.double_clicks[target];
    if (h && !a) {
      this.double_clicks[target] = [this._update_count];
    } else if (!h && a && a?.[1] === void 0) {
      a[1] = this._update_count;
    } else if (h && a && a?.[1] !== void 0 && a?.[2] === void 0) {
      a[2] = this._update_count;
      const ret = a[2] - a[1] < DOUBLE_CLICK_INTERVAL && a[1] - a[0] < DOUBLE_CLICK_INTERVAL;
      this.double_clicks[target] = void 0;
      return ret;
    }
    return false;
  }
}
