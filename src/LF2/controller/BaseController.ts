import type { IFrameInfo, IHitKeyCollection, TLooseGameKey } from "../defines";
import { GameKey, StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
import DoubleClick from "./DoubleClick";
import { KeyStatus } from "./KeyStatus";
export type TKeys = Record<GameKey, string>;

export const KEY_NAME_LIST = [
  GameKey.d,
  GameKey.L,
  GameKey.R,
  GameKey.U,
  GameKey.D,
  GameKey.j,
  GameKey.a,
] as const;
export const CONFLICTS_KEY_MAP: Record<GameKey, GameKey | undefined> = {
  a: void 0,
  j: void 0,
  d: void 0,
  [GameKey.L]: GameKey.R,
  [GameKey.R]: GameKey.L,
  [GameKey.U]: GameKey.D,
  [GameKey.D]: GameKey.U,
};

/**
 * @link https://www.processon.com/view/link/6765125f16640e2a68b21418?cid=6764eb96c3e02b46ac818e40
 */
export class BaseController {
  readonly is_base_controller = true;

  private _time = 10;
  private _disposers = new Set<() => void>();
  private _player_id: string;
  get player_id(): string {
    return this._player_id;
  }
  get world() {
    return this.entity.world;
  }
  get lf2() {
    return this.world.lf2;
  }
  get time() {
    return this._time;
  }
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f)) for (const i of f) this._disposers.add(i);
    else this._disposers.add(f);
  }
  entity: Entity;
  keys: Record<TLooseGameKey, KeyStatus> = {
    L: new KeyStatus(this),
    R: new KeyStatus(this),
    U: new KeyStatus(this),
    D: new KeyStatus(this),
    a: new KeyStatus(this),
    j: new KeyStatus(this),
    d: new KeyStatus(this),
  };

  readonly dbc: Record<TLooseGameKey, DoubleClick<IFrameInfo>>;

  get LR(): 0 | 1 | -1 {
    const L = !!this.keys.L.time;
    const R = !!this.keys.R.time;
    return L === R ? 0 : R ? 1 : -1;
  }

  get UD(): 0 | 1 | -1 {
    const U = !!this.keys.U.time;
    const D = !!this.keys.D.time;
    return U === D ? 0 : D ? 1 : -1;
  }

  get jd(): 0 | 1 | -1 {
    const d = !!this.keys.d.time;
    const j = !!this.keys.j.time;
    return d === j ? 0 : d ? 1 : -1;
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
  start(...keys: TLooseGameKey[]): this {
    this.queue.push(...keys.map(k => [1, k] as const))
    return this;
  }

  /**
   * 指定按键进入hold状态
   * @param keys 指定按键
   * @returns {this}
   */
  hold(...keys: TLooseGameKey[]): this {
    this.queue.push(...keys.map(k => [2, k] as const))
    return this;
  }

  /**
   * 指定按键进入end状态（松开）
   * @param keys 指定按键
   * @returns {this}
   */
  end(...keys: TLooseGameKey[]): this {
    this.queue.push(...keys.map(k => [0, k] as const))
    return this;
  }

  /**
   * 指定按键直接进入"双击"状态(结尾不会抬起)
   * like: ⬇+⬆+⬇
   * @param keys 指定按键
   * @returns {this}
   */
  db_hit(...keys: TLooseGameKey[]): this {
    this.start(...keys)
      .end(...keys)
      .start(...keys);
    return this;
  }
  is_hold(k: string): boolean;
  is_hold(k: TLooseGameKey): boolean;
  is_hold(k: TLooseGameKey): boolean {
    return !!this.keys[k]?.is_hld();
  }

  is_hit(k: string): boolean;
  is_hit(k: TLooseGameKey): boolean;
  is_hit(k: TLooseGameKey): boolean {
    return !!this.keys[k]?.is_hit();
  }

  is_db_hit(k: TLooseGameKey): boolean {
    const {
      time,
      data: [f_0, f_1],
    } = this.dbc[k];
    if (
      f_0?.state !== StateEnum.Standing &&
      f_0?.state !== StateEnum.Walking &&
      f_1?.state !== StateEnum.Standing &&
      f_1?.state !== StateEnum.Walking &&
      (k === GameKey.L || k === GameKey.R)
    ) {
      /*
        Note: 
          （特殊对待跑步的逻辑）
          状态为“站立”与“行走”的帧，左键或右键双击，
          需要两次点击的帧状态均为“站立”或“行走”，才视为双击。
            -Gim
      */
      return false;
    }
    return time > 0 && this._time - time <= this.entity.world.key_hit_duration;
  }
  is_end(k: string): boolean;
  is_end(k: TLooseGameKey): boolean;
  is_end(k: TLooseGameKey): boolean {
    return !!this.keys[k]?.is_end();
  }

  is_start(k: string): boolean;
  is_start(k: TLooseGameKey): boolean;
  is_start(k: TLooseGameKey): boolean {
    return !!this.keys[k]?.is_start();
  }
  press(...keys: TLooseGameKey[]) {
    for (const k of keys) if (this.is_end(k)) this.start(k);
    return this;
  }
  release(...keys: TLooseGameKey[]) {
    for (const k of keys) if (!this.is_end(k)) this.end(k);
    return this;
  }
  constructor(player_id: string, entity: Entity) {
    this._player_id = player_id;
    this.entity = entity;
    this.dbc = {
      d: new DoubleClick("d", entity.world.double_click_interval),
      a: new DoubleClick("a", entity.world.double_click_interval),
      j: new DoubleClick("j", entity.world.double_click_interval),
      L: new DoubleClick("L", entity.world.double_click_interval),
      R: new DoubleClick("R", entity.world.double_click_interval),
      U: new DoubleClick("U", entity.world.double_click_interval),
      D: new DoubleClick("D", entity.world.double_click_interval),
    };
  }
  dispose(): void {
    for (const f of this._disposers) f();
  }
  tst(type: "hit" | "hld" | "dbl", key: TLooseGameKey) {
    const conflict_key = CONFLICTS_KEY_MAP[key];
    if (conflict_key && !this.is_end(conflict_key)) return false;
    if (type === "dbl") return this.is_db_hit(key);
    if (type === "hit") return this.keys[key].is_hit() && !this.keys[key].used;
    else return this.keys[key].is_hld();
  }

  protected result = new ControllerUpdateResult();
  readonly queue: (readonly [0 | 1 | 2, TLooseGameKey])[] = []
  update(): ControllerUpdateResult {
    if (this.queue.length) {
      for (const [status, k] of this.queue) {
        switch (status) {
          case 0:
            if (!this.is_end(k))
              this.keys[k].end();
            break;
          case 1:
            if (!this.is_end(k)) break;
            this.keys[k].hit(this._time);
            const ck = CONFLICTS_KEY_MAP[k];
            if (ck) this.dbc[ck].reset();
            this.dbc[k].press(this._time, this.entity.frame);
            break;
          case 2:
            this.keys[k].hit(this._time - this.entity.world.key_hit_duration);
            break;
        }
      }
      this.queue.length = 0;
    }

    ++this._time;
    const entity = this.entity;
    const frame = entity.frame;
    const { hold: hld, hit } = frame;

    // 按键序列初始化
    if (this.keys.d.is_start()) this._key_list = "";

    const ret = this.result;
    ret.set(void 0, 0);

    const { facing } = entity;
    let F: "L" | "R" = facing === 1 ? "R" : "L";
    let B: "L" | "R" = facing === 1 ? "L" : "R";

    if (hit) {
      /** 相对方向的按钮判定 */
      if (hit.F && this.tst("hit", F) && !ret.time)
        ret.set(hit.F, this.keys[F].use(), F);
      if (hit.B && this.tst("hit", B) && !ret.time)
        ret.set(hit.B, this.keys[B].use(), B);

      /** 相对方向的双击判定 */
      if (hit.FF && this.tst("dbl", F)) ret.set(hit.FF, this.dbc[F].time);
      if (hit.BB && this.tst("dbl", B)) ret.set(hit.BB, this.dbc[B].time);
    }

    /** 相对方向的按钮判定 */
    if (hld) {
      if (hld.F && this.tst("hld", F)) ret.set(hld.F, this.keys[F].time, F);
      if (hld.B && this.tst("hld", B)) ret.set(hld.B, this.keys[B].time, B);
    }

    for (const name of KEY_NAME_LIST) {
      const key = this.keys[name];

      /** 加入按键序列，但d除外，因为d是按键序列的开始 */
      if (name !== "d" && this.is_start(name)) this._key_list += name;

      if (hit) {
        /** 按键判定 */
        let act = hit[name];
        if (act && this.tst("hit", name) && !ret.time) {
          ret.set(act, key.use(), name);
        }

        /** 双击判定 */
        const keykey = `${name}${name}` as keyof IHitKeyCollection;
        act = hit[keykey];
        if (act && this.tst("dbl", name)) {
          ret.set(act, this.dbc[name].time);
        }
      }
      if (hld) {
        /** 长按判定 */
        let act = hld[name];
        if (act && this.tst("hld", name) && !ret.time) {
          ret.set(act, key.time, name);
        }
      }
    }

    const seqs = hit?.sequences;
    this.check_hit_seqs(seqs, ret);

    /** 这里不想支持过长的指令 */
    if (this._key_list && this._key_list.length >= 10) this._key_list = void 0;
    return ret;
  }

  private check_hit_seqs(
    seqs: IHitKeyCollection["sequences"],
    ret: ControllerUpdateResult,
  ) {
    if (seqs)
      do {
        /** 同时按键 判定 */
        if (this.keys.d.is_hit()) {
          const seq = Object.keys(seqs).find((v) => this.seq_test(v));
          if (seq && seqs[seq]) {
            for (const k of seq) this.keys[k as GameKey]?.use();
            ret.set(seqs[seq], this._time, void 0, this._key_list);
            this._key_list = void 0;
            break;
          } else {
            ret.key_list = this._key_list;
          }
        }

        /** 顺序按键 判定 */
        if (
          this._key_list &&
          this._key_list.length >= 2 &&
          seqs[this._key_list]
        ) {
          ret.set(seqs[this._key_list], this._time, void 0, this._key_list);
          this._key_list = void 0;
          break;
        } else {
          ret.key_list = this._key_list;
        }
      } while (0);
  }

  private seq_test(str: string): boolean {
    for (const key of str) if (!this.is_hit(key)) return false;
    return true;
  }
}
