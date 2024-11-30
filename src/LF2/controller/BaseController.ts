import { ICharacterFrameInfo, TNextFrame } from '../defines';
import GameKey from '../defines/GameKey';
import { IHitKeyCollection } from '../defines/IHitKeyCollection';
import { Defines } from '../defines/defines';
import Character from '../entity/Character';
import DoubleClick from './DoubleClick';

export type TKeys = Record<GameKey, string>

export const KEY_NAME_LIST = [
  GameKey.d, 
  GameKey.L, GameKey.R, GameKey.U, GameKey.D, 
  GameKey.j, GameKey.a] as const;
export const CONFLICTS_KEY_MAP: Record<GameKey, GameKey | undefined> = {
  a: void 0,
  j: void 0,
  d: void 0,
  [GameKey.L]: GameKey.R,
  [GameKey.R]: GameKey.L,
  [GameKey.U]: GameKey.D,
  [GameKey.D]: GameKey.U,
}

export class BaseController {
  readonly is_base_controller = true;
  static is = (v: any): v is BaseController => v?.is_base_controller === true

  private _time = 1;
  private _disposers = new Set<() => void>();
  private _player_id: string;
  get player_id(): string { return this._player_id }
  get world() { return this.character.world }
  get lf2() { return this.world.lf2 }
  get time() { return this._time }
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }
  character: Character;
  key_time_maps: Record<GameKey, number> = { L: 0, R: 0, U: 0, D: 0, a: 0, j: 0, d: 0 };

  readonly dbc_map: Record<GameKey, DoubleClick<ICharacterFrameInfo>>;

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

  /**
   * 指定按键进入start状态（按下）
   * @param keys 指定按键
   * @returns {this}
   */
  start(...keys: GameKey[]): this {
    for (const k of keys) {
      this.key_time_maps[k] = this._time;
      const ck = CONFLICTS_KEY_MAP[k];
      if (ck) this.dbc_map[ck].reset();

      this.dbc_map[k].press(this._time, this.character.get_frame());
    };
    return this;
  }

  /**
   * 指定按键进入hold状态
   * @param keys 指定按键
   * @returns {this}
   */
  hold(...keys: GameKey[]): this {
    for (const k of keys)
      this.key_time_maps[k] = this._time - this.character.world.key_hit_duration;
    return this;
  }

  /**
   * 指定按键进入end状态（松开）
   * @param keys 指定按键
   * @returns {this}
   */
  end(...keys: GameKey[]): this {
    for (const k of keys) this.key_time_maps[k] = 0;
    return this;
  }

  /**
   * 指定按键直接进入"双击"状态
   * @param keys 指定按键
   * @returns {this}
   */
  db_hit = (...keys: GameKey[]): this => {
    for (const k of keys)
      this.key_time_maps[k] = this._time;
    return this;
  }
  is_hit_or_hold(k: string): boolean;
  is_hit_or_hold(k: GameKey): boolean;
  is_hit_or_hold(k: GameKey): boolean {
    return !!this.key_time_maps[k];
  }

  is_hold(k: string): boolean;
  is_hold(k: GameKey): boolean;
  is_hold(k: GameKey): boolean {
    return !this.is_hit(k) && !!this.key_time_maps[k];
  }

  is_hit(k: string): boolean;
  is_hit(k: GameKey): boolean;
  is_hit(k: GameKey): boolean {
    const v = this.key_time_maps[k];
    return !!v && this._time - v <= this.character.world.key_hit_duration;
  }
  is_db_hit(k: GameKey): boolean {
    const { time } = this.dbc_map[k];
    const ret = time > 0 && this._time - time <= this.character.world.key_hit_duration;
    return ret;
  }
  is_end(k: string): boolean;
  is_end(k: GameKey): boolean;
  is_end(k: GameKey): boolean {
    return !this.key_time_maps[k];
  }
  is_start(k: string): boolean;
  is_start(k: GameKey): boolean;
  is_start(k: GameKey): boolean {
    return this.key_time_maps[k] === this._time - 1;
  }

  constructor(player_id: string, character: Character) {
    this._player_id = player_id;
    this.character = character;
    this.dbc_map = {
      d: new DoubleClick('d', character.world.double_click_interval),
      a: new DoubleClick('a', character.world.double_click_interval),
      j: new DoubleClick('j', character.world.double_click_interval),
      L: new DoubleClick('L', character.world.double_click_interval),
      R: new DoubleClick('R', character.world.double_click_interval),
      U: new DoubleClick('U', character.world.double_click_interval),
      D: new DoubleClick('D', character.world.double_click_interval)
    }
  }

  dispose(): void {
    for (const f of this._disposers) f();
  }

  _key_test(type: 'hit' | 'hold', key: GameKey) {
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
    const { hold: hld, hit, state } = frame;
    let nf: [TNextFrame | undefined, number, GameKey | undefined] = [void 0, 0, void 0];

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
      if (hit?.F && hit_R && end_L && nf[1] < this.key_time_maps.R) nf = [hit.F, this.key_time_maps.R, GameKey.R];
      if (hit?.B && hit_L && end_R && nf[1] < this.key_time_maps.L) nf = [hit.B, this.key_time_maps.L, GameKey.L];
      if (hld?.F && hold_R && end_L && nf[1] < this.key_time_maps.R) nf = [hld.F, this.key_time_maps.R, GameKey.R];
      if (hld?.B && hold_L && end_R && nf[1] < this.key_time_maps.L) nf = [hld.B, this.key_time_maps.L, GameKey.L];
    } else {
      if (hit?.F && hit_L && end_R && nf[1] < this.key_time_maps.L) nf = [hit.F, this.key_time_maps.L, GameKey.L];
      if (hit?.B && hit_R && end_L && nf[1] < this.key_time_maps.R) nf = [hit.B, this.key_time_maps.R, GameKey.R];
      if (hld?.F && hold_L && end_R && nf[1] < this.key_time_maps.L) nf = [hld.F, this.key_time_maps.L, GameKey.L];
      if (hld?.B && hold_R && end_L && nf[1] < this.key_time_maps.R) nf = [hld.B, this.key_time_maps.R, GameKey.R];
    }
    /** 相对方向的双击判定 */
    if (hit?.FF && facing < 0 && this.is_db_hit(GameKey.L)) nf = [hit.FF, this.dbc_map.L.time, void 0];
    if (hit?.BB && facing > 0 && this.is_db_hit(GameKey.L)) nf = [hit.BB, this.dbc_map.L.time, void 0];
    if (hit?.BB && facing < 0 && this.is_db_hit(GameKey.R)) nf = [hit.BB, this.dbc_map.R.time, void 0];
    if (hit?.FF && facing > 0 && this.is_db_hit(GameKey.R)) nf = [hit.FF, this.dbc_map.R.time, void 0];

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
      act = hld?.[key]
      if (act && this._key_test('hold', key) && nf[1] < press_time) {
        nf = [act, press_time, key];
      }

      /** 双击判定 */
      const key_key = `${key}${key}` as keyof IHitKeyCollection;
      act = hit?.[key_key]
      if (act && this.is_db_hit(key)) {
        nf = [act, this.dbc_map[key].time, void 0];
      }
    }

    switch (state) {
      case Defines.State.Standing:
      case Defines.State.Walking:
        /** FIXME: 重击判定 */
        if (this.is_hit('a')) {
          const super_punch = character.find_v_rest((_, v) => v.itr.kind === Defines.ItrKind.SuperPunchMe);
          if (super_punch) {
            nf = [{ id: character.data.indexes.super_punch }, this.key_time_maps.a, GameKey.a];
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