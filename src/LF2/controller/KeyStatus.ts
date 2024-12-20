import { BaseController } from "./BaseController";

export class KeyStatus {
  readonly ctrl: BaseController;
  private _t: number = 0;
  private _u: 0 | 1 = 0;
  get time(): number { return this._t };

  /**
   * 按键是否被消耗
   *
   * @type {(0 | 1)}
   * @memberof KeyStatus
   */
  get used(): 0 | 1 { return this._u };

  constructor(ctrl: BaseController) {
    this.ctrl = ctrl;
  }
  use() {
    this._u = 1;
    return this._t;
  }
  is_start(): boolean {
    const { _t } = this
    return !!_t && _t === this.ctrl.time - 1;
  }
  is_hit(): boolean {
    const { _t } = this;
    return !!_t && this.ctrl.time - _t <= this.ctrl.entity.world.key_hit_duration;
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
