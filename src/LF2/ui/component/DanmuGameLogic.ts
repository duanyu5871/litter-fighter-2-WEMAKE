import { IEntityCallbacks } from "../../entity";
import { Entity } from "../../entity/Entity";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { Times } from "../utils/Times";
import { UIComponent } from "./UIComponent";
export class DanmuGameLogic extends UIComponent {
  static override readonly TAG = 'DanmuGameLogic';
  private _countdown = new Times(0, 60 * 30);
  private _staring: Entity | undefined;
  private _teams = new Set<string>();
  private _cb: IEntityCallbacks = {
    on_disposed: () => {
      this._countdown.reset();
      this.staring = this.lf2.random_get(this.lf2.characters.list())
    }
  }
  update_teams() {
    const fighters = this.lf2.characters.list();
    this._teams.clear()
    for (const fighter of fighters)
      this._teams.add(fighter.team);
  }
  private _cb2: IWorldCallbacks = {
    on_fighter_del: () => this.update_teams(),
    on_fighter_add: () => this.update_teams()
  }

  get staring(): Entity | undefined {
    return this._staring;
  }
  set staring(v: Entity | undefined) {
    this._staring?.callbacks.del(this._cb)
    this._staring = v;
    this._staring?.callbacks.add(this._cb)
  };
  override on_start(): void {
    super.on_start?.();
    this.update_bg();
    this.world.callbacks.add(this._cb2)
    this.lf2.sounds.play_bgm('?')
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this._cb2)
  }

  update_bg() {
    this.lf2.change_bg('?');
    this.lf2.characters
      .add_random(10, '?')
      .forEach(v => {
        v.is_key_role = true;
        v.is_gone_dead = true;
        v.blinking = 120;
      })
    this.lf2.characters
      .add_random(10, '')
      .forEach(v => {
        v.is_key_role = true;
        v.is_gone_dead = true;
        v.blinking = 120;
      })
    this.update_staring();

    const { staring } = this
    debugger
    if (staring) this.world.lock_cam_x = this.world.renderer.cam_x = staring.position.x - this.world.screen_w / 2
  }
  update_staring() {
    const fighters = this.lf2.characters.list();
    this.staring = this.lf2.random_get(fighters)
  }
  override update(dt: number): void {
    super.update?.(dt)
    this._countdown.add();
    if (this._countdown.is_end()) this.update_staring()

    const { staring } = this
    if (staring) this.world.lock_cam_x = staring.position.x - this.world.screen_w / 2
    else if (!staring) this.update_staring()

    if (this._teams.size <= 1) this.update_bg()
  }
}
