import { BaseController } from "./BaseController";

export class KeyStatus {
  readonly ctrl: BaseController;
  /**
   * 按键按下的时间
   *
   * @private
   * @type {number}
   * @memberof KeyStatus
   */
  private _t: number = 0;
  private _u: 0 | 1 = 0;

  /**
   * 按键按下的时间
   *
   * @readonly
   * @type {number}
   * @memberof KeyStatus
   */
  get time(): number {
    return this._t;
  }

  /**
   * 按键是否被消耗
   *
   * @type {(0 | 1)}
   * @memberof KeyStatus
   */
  get used(): 0 | 1 {
    return this._u;
  }

  constructor(ctrl: BaseController) {
    this.ctrl = ctrl;
  }
  use() {
    this._u = 1;
    return this._t;
  }
  is_start(): boolean {
    const { _t } = this;
    return !!_t && _t === this.ctrl.time - 1;
  }
  is_hit(): boolean {
    const { _t } = this;
    if(!_t) return false;
    /** 按键时长（单位帧） */
    const dt = this.ctrl.time - _t
    /** 按键时长短于一定时间内时，视为按键被按下 */
    return dt < this.ctrl.entity.world.key_hit_duration;
  }
  is_hld(): boolean {
    return !this.is_hit() && !!this._t;
  }
  is_end(): boolean {
    return !this._t;
  }
  hit(t: number): void {
    this._t = t;
    this._u = 0;
  }
  end(): void {
    this._t = 0;
    this._u = 0;
  }
}
