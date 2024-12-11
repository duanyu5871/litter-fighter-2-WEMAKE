import { IFrameInfo, TNextFrame } from '../defines';
import GameKey from '../defines/GameKey';
import { IHitKeyCollection } from '../defines/IHitKeyCollection';
import { Defines } from '../defines/defines';
import Entity from '../entity/Entity';
import { is_character } from '../entity/type_check';
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


class ControllerUpdateResult {
  next_frame?: TNextFrame;
  time: number = 0;
  game_key?: GameKey;
  key_list?: string;
  set(
    next_frame: TNextFrame | undefined,
    time: number,
    game_key?: GameKey,
    key_list?: string,
  ) {
    this.next_frame = next_frame
    this.time = time
    this.game_key = game_key
    this.key_list = key_list
  }
}
export class BaseController {
  readonly is_base_controller = true

  private _time = 1;
  private _disposers = new Set<() => void>();
  private _player_id: string;
  get player_id(): string { return this._player_id }
  get world() { return this.entity.world }
  get lf2() { return this.world.lf2 }
  get time() { return this._time }
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }
  entity: Entity;
  key_time_maps: Record<GameKey, number> = { L: 0, R: 0, U: 0, D: 0, a: 0, j: 0, d: 0 };

  readonly dbc_map: Record<GameKey, DoubleClick<IFrameInfo>>;

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
  reset_key_list() {
    this._key_list = void 0;
  }
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

      this.dbc_map[k].press(this._time, this.entity.get_frame());
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
      this.key_time_maps[k] = this._time - this.entity.world.key_hit_duration;
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
   * 指定按键直接进入"双击"状态(结尾不会抬起)
   * like: ⬇+⬆+⬇
   * @param keys 指定按键
   * @returns {this}
   */
  db_hit(...keys: GameKey[]): this {
    this.start(...keys).end(...keys).start(...keys)
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
    return !!v && this._time - v <= this.entity.world.key_hit_duration;
  }
  is_db_hit(k: GameKey): boolean {
    const { time } = this.dbc_map[k];
    const ret = time > 0 && this._time - time <= this.entity.world.key_hit_duration;
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

  constructor(player_id: string, character: Entity) {
    this._player_id = player_id;
    this.entity = character;
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


  nf = new ControllerUpdateResult()
  update(): ControllerUpdateResult {
    ++this._time;
    const entity = this.entity;
    const frame = entity.get_frame();
    const { hold: hld, hit, state } = frame;

    // 按键序列初始化
    if (this.is_start('d')) this._key_list = '';
    this.nf.set(void 0, 0)
    const hit_L = this.is_hit('L');
    const hit_R = this.is_hit('R');
    const hold_L = this.is_hold('L');
    const hold_R = this.is_hold('R');
    const end_L = this.is_end('L');
    const end_R = this.is_end('R');

    const { facing } = entity;
    /** 相对方向的按钮判定 */
    if (facing === 1) {
      if (hit?.F && hit_R && end_L && this.nf.time < this.key_time_maps.R) this.nf.set(hit.F, this.key_time_maps.R, GameKey.R);
      if (hit?.B && hit_L && end_R && this.nf.time < this.key_time_maps.L) this.nf.set(hit.B, this.key_time_maps.L, GameKey.L);
      if (hld?.F && hold_R && end_L && this.nf.time < this.key_time_maps.R) this.nf.set(hld.F, this.key_time_maps.R, GameKey.R);
      if (hld?.B && hold_L && end_R && this.nf.time < this.key_time_maps.L) this.nf.set(hld.B, this.key_time_maps.L, GameKey.L);
    } else {
      if (hit?.F && hit_L && end_R && this.nf.time < this.key_time_maps.L) this.nf.set(hit.F, this.key_time_maps.L, GameKey.L);
      if (hit?.B && hit_R && end_L && this.nf.time < this.key_time_maps.R) this.nf.set(hit.B, this.key_time_maps.R, GameKey.R);
      if (hld?.F && hold_L && end_R && this.nf.time < this.key_time_maps.L) this.nf.set(hld.F, this.key_time_maps.L, GameKey.L);
      if (hld?.B && hold_R && end_L && this.nf.time < this.key_time_maps.R) this.nf.set(hld.B, this.key_time_maps.R, GameKey.R);
    }
    /** 相对方向的双击判定 */
    if (hit?.FF && facing < 0 && this.is_db_hit(GameKey.L)) this.nf.set(hit.FF, this.dbc_map.L.time);
    if (hit?.BB && facing > 0 && this.is_db_hit(GameKey.L)) this.nf.set(hit.BB, this.dbc_map.L.time);
    if (hit?.BB && facing < 0 && this.is_db_hit(GameKey.R)) this.nf.set(hit.BB, this.dbc_map.R.time);
    if (hit?.FF && facing > 0 && this.is_db_hit(GameKey.R)) this.nf.set(hit.FF, this.dbc_map.R.time);

    for (const key of KEY_NAME_LIST) {
      /** 加入按键序列，但d除外，因为d是按键序列的开始 */
      if (this._key_list !== void 0 && key !== 'd' && this.is_start(key))
        this._key_list += key;

      /** 按键判定 */
      let act = hit?.[key];
      let press_time = this.key_time_maps[key];
      if (act && this._key_test('hit', key) && this.nf.time < press_time) {
        this.nf.set(act, press_time, key);
      }

      /** 长按判定 */
      act = hld?.[key]
      if (act && this._key_test('hold', key) && this.nf.time < press_time) {
        this.nf.set(act, press_time, key);
      }

      /** 双击判定 */
      const key_key = `${key}${key}` as keyof IHitKeyCollection;
      act = hit?.[key_key]
      if (act && this.is_db_hit(key)) {
        this.nf.set(act, this.dbc_map[key].time);
      }
    }

    switch (state) {
      case Defines.State.Standing:
      case Defines.State.Walking:
        /** FIXME: 重击判定 */
        if (this.is_hit('a') && is_character(entity)) {
          const super_punch = entity.find_v_rest((_, v) => v.itr.kind === Defines.ItrKind.SuperPunchMe);
          if (super_punch) {
            this.nf.set({ id: entity.data.indexes.super_punch }, this.key_time_maps.a, GameKey.a);
          }
          // console.log("super_punch:", super_punch)
        }
        break;
    }
    const seqs = hit?.sequences
    if (seqs) do {
      /** 同时按键 判定 */
      if (this.is_hit('d')) {
        const seq = Object.keys(seqs).find(v => this.same_time_seq_test(v));
        if (seq && seqs[seq]) {
          this.nf.set(seqs[seq], this._time, void 0, this._key_list);
          this._key_list = void 0;
          break;
        } else {
          this.nf.key_list = this._key_list
        }
      }

      /** 顺序按键 判定 */
      if (this._key_list && this._key_list.length >= 2 && seqs[this._key_list]) {
        this.nf.set(seqs[this._key_list], this._time, void 0, this._key_list)
        this._key_list = void 0;
        break;
      } else {
        this.nf.key_list = this._key_list;
      }
    } while (0)

    /** 这里不想支持过长的指令 */
    if (this._key_list && this._key_list.length >= 10) this._key_list = void 0;
    return this.nf
  }

  private same_time_seq_test(str: string): boolean {
    for (const key of str) if (!this.is_hit(key)) return false;
    return true;
  }
}