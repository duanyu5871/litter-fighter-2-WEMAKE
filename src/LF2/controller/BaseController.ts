import { TNextFrame } from '../../common/lf2_type';
import { IHitKeyCollection } from '../../common/lf2_type/IHitKeyCollection';
import { Defines } from '../../common/lf2_type/defines';
import Character from '../entity/Character';
export type TKeyName = 'L' | 'R' | 'U' | 'D' | 'a' | 'j' | 'd'
export type TKeys = Record<TKeyName, string>
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

class DoubleClick {
  press(time: number, character: Character) {
    if (this.time === 0) {
      // 双击判定：首次按下
      this.time = -time;
      this.frame_state_1 = character.get_frame().state;
    } else if (this.time + time < character.world.double_click_interval) {
      //  双击判定：间隔时间内再次按下
      this.time = time
      this.frame_state_2 = character.get_frame().state;
    } else {
      // 双击判定：超时，非双击
      this.reset();
    }
  }
  frame_state_2?: number;
  frame_state_1?: number;
  time: number = 0;
  reset() {
    this.time = 0;
    this.frame_state_1 = void 0;
    this.frame_state_2 = void 0;
  }
}
export class BaseController {
  readonly is_base_controller = true;
  static is = (v: any): v is BaseController => v?.is_base_controller === true

  private _time = 1;
  private _disposers = new Set<() => void>();
  get time() { return this._time }
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }
  character: Character;
  key_time_maps: Record<TKeyName, number> = { L: 0, R: 0, U: 0, D: 0, a: 0, j: 0, d: 0 };

  /**
   * 指定按键进入start状态（按下）
   * @param keys 指定按键
   * @returns {this}
   */
  start(...keys: TKeyName[]): this {
    for (const k of keys) {
      this.key_time_maps[k] = this._time;
      const ck = CONFLICTS_KEY_MAP[k];
      if (ck) this.db_time_map[ck].reset();

      this.db_time_map[k].press(this._time, this.character);
    };
    return this;
  }

  /**
   * 指定按键进入hold状态
   * @param keys 指定按键
   * @returns {this}
   */
  hold(...keys: TKeyName[]): this {
    for (const k of keys)
      this.key_time_maps[k] = this._time - this.character.world.key_hit_duration;
    return this;
  }

  /**
   * 指定按键进入end状态（松开）
   * @param keys 指定按键
   * @returns {this}
   */
  end(...keys: TKeyName[]): this {
    for (const k of keys) this.key_time_maps[k] = 0;
    return this;
  }

  /**
   * 指定按键直接进入"双击"状态
   * @param keys 指定按键
   * @returns {this}
   */
  db_hit = (...keys: TKeyName[]): this => {
    for (const k of keys)
      this.key_time_maps[k] = this._time;
    return this;
  }


  is_hold(k: string): boolean;
  is_hold(k: TKeyName): boolean;
  is_hold(k: TKeyName): boolean {
    return !this.is_hit(k) && !!this.key_time_maps[k];
  }

  is_hit(k: string): boolean;
  is_hit(k: TKeyName): boolean;
  is_hit(k: TKeyName): boolean {
    const v = this.key_time_maps[k];
    return !!v && this._time - v <= this.character.world.key_hit_duration;
  }
  is_db_hit(k: TKeyName): boolean {
    const { time } = this.db_time_map[k];
    const ret = time > 0 && this._time - time <= this.character.world.key_hit_duration;
    return ret;
  }
  is_end(k: string): boolean;
  is_end(k: TKeyName): boolean;
  is_end(k: TKeyName): boolean {
    return !this.key_time_maps[k];
  }
  is_start(k: string): boolean;
  is_start(k: TKeyName): boolean;
  is_start(k: TKeyName): boolean {
    return this.key_time_maps[k] === this._time - 1;
  }
  readonly db_time_map: Record<TKeyName, DoubleClick> = {
    d: new DoubleClick(),
    a: new DoubleClick(),
    j: new DoubleClick(),
    L: new DoubleClick(),
    R: new DoubleClick(),
    U: new DoubleClick(),
    D: new DoubleClick()
  };
  get LR(): 0 | 1 | -1 {
    const L = !!this.key_time_maps.L;
    const R = !!this.key_time_maps.R;
    return L === R ? 0 : R ? 1 : -1;
  }
  get UD(): 0 | 1 | -1 {
    const U = !!this.key_time_maps.U;
    const D = !!this.key_time_maps.D;
    return U === D ? 0 : D ? 1 : -1;
  }

  private _key_list: string | undefined = void 0;
  constructor(character: Character) {
    this.character = character;
  }

  dispose(): void {
    for (const f of this._disposers) f();
  }

  _key_test(type: 'hit' | 'hold', key: TKeyName) {
    const conflict_key = CONFLICTS_KEY_MAP[key];
    if (conflict_key && !this.is_end(conflict_key))
      return false;
    return this[`is_${type}`](key);
  }

  update(): TNextFrame | undefined {
    ++this._time;
    const character = this.character;
    const { facing } = character;
    const frame = character.get_frame();
    const { hold, hit, state } = frame;
    let nf: [TNextFrame | undefined, number, TKeyName | undefined] = [void 0, 0, void 0];

    // 按键序列初始化
    if (this.is_start('d')) this._key_list = '';

    const hit_L = this.is_hit('L');
    const hit_R = this.is_hit('R');
    const hold_L = this.is_hold('L');
    const hold_R = this.is_hold('R');
    const end_L = this.is_end('L');
    const end_R = this.is_end('R');

    /** 相对方向的按钮判定 */
    if (facing === 1) {
      if (hit?.F && hit_R && end_L && nf[1] < this.key_time_maps.R) nf = [hit.F, this.key_time_maps.R, 'R'];
      if (hit?.B && hit_L && end_R && nf[1] < this.key_time_maps.L) nf = [hit.B, this.key_time_maps.L, 'L'];
      if (hold?.F && hold_R && end_L && nf[1] < this.key_time_maps.R) nf = [hold.F, this.key_time_maps.R, 'R'];
      if (hold?.B && hold_L && end_R && nf[1] < this.key_time_maps.L) nf = [hold.B, this.key_time_maps.L, 'L'];
    } else {
      if (hit?.F && hit_L && end_R && nf[1] < this.key_time_maps.L) nf = [hit.F, this.key_time_maps.L, 'L'];
      if (hit?.B && hit_R && end_L && nf[1] < this.key_time_maps.R) nf = [hit.B, this.key_time_maps.R, 'R'];
      if (hold?.F && hold_L && end_R && nf[1] < this.key_time_maps.L) nf = [hold.F, this.key_time_maps.L, 'L'];
      if (hold?.B && hold_R && end_L && nf[1] < this.key_time_maps.R) nf = [hold.B, this.key_time_maps.R, 'R'];
    }
    /** 相对方向的双击判定 */
    if (hit?.FF && facing < 0 && this.is_db_hit('L') && nf[1] < this.db_time_map.L.time) nf = [hit.FF, this.db_time_map.L.time, void 0];
    if (hit?.BB && facing > 0 && this.is_db_hit('L') && nf[1] < this.db_time_map.L.time) nf = [hit.BB, this.db_time_map.L.time, void 0];
    if (hit?.BB && facing < 0 && this.is_db_hit('R') && nf[1] < this.db_time_map.R.time) nf = [hit.BB, this.db_time_map.R.time, void 0];
    if (hit?.FF && facing > 0 && this.is_db_hit('R') && nf[1] < this.db_time_map.R.time) nf = [hit.FF, this.db_time_map.R.time, void 0];

    for (const key of KEY_NAME_LIST) {
      /** 加入按键序列，但d除外，因为d是按键序列的开始 */
      if (this._key_list !== void 0 && key !== 'd' && this.is_start(key))
        this._key_list += key;

      /** 按键判定 */
      let act = hit?.[key];
      let press_time = this.key_time_maps[key];
      if (act && this._key_test('hit', key) && nf[1] < press_time) {
        nf = [act, press_time, key];
      }

      /** 长按判定 */
      act = hold?.[key]
      if (act && this._key_test('hold', key) && nf[1] < press_time) {
        nf = [act, press_time, key];
      }

      /** 双击判定 */
      const key_key = `${key}${key}` as keyof IHitKeyCollection;
      act = hit?.[key_key]
      press_time = this.db_time_map[key].time;
      if (act && this.is_db_hit(key) && nf[1] < press_time) {
        nf = [act, press_time, void 0];
      }
    }

    switch (state) {
      case Defines.State.Standing:
      case Defines.State.Walking:
        /** FIXME: 重击判定 */
        if (this.is_hit('a')) {
          const super_punch = character.find_v_rest((_, v) => v.itr.kind === Defines.ItrKind.SuperPunchMe);
          if (super_punch) {
            nf = [{ id: character.data.indexes.super_punch }, this.key_time_maps.a, 'a'];
          }
          console.log("super_punch:", super_punch)
        }
        break;
    }
    const seqs = hit?.sequences
    if (seqs) do {
      /** 同时按键 判定 */
      if (this.is_hit('d')) {
        const seq = Object.keys(seqs).find(v => this.same_time_seq_test(v));
        if (seq && seqs[seq]) {
          nf = [seqs[seq], this._time, void 0];
          this._key_list = void 0;
          break;
        }
      }

      /** 顺序按键 判定 */
      if (this._key_list && this._key_list.length >= 2 && seqs[this._key_list]) {
        nf = [seqs[this._key_list], this._time, void 0]
        this._key_list = void 0;
        break;
      }
    } while (0)

    /** 这里不想支持过长的指令 */
    if (this._key_list && this._key_list.length >= 10) this._key_list = void 0;

    return nf[0]
  }

  private same_time_seq_test(str: string): boolean {
    for (const key of str) if (!this.is_hit(key)) return false;

    return true;
  }
}