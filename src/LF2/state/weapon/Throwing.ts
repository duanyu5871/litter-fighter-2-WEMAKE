import { IFrameInfo } from "../../defines";
import type Weapon from "../../entity/Weapon";
import BaseWeaponState from "./Base";

export default class Throwing extends BaseWeaponState {
  /**
   * 用于确保丢出的武器只受一次跌落伤害
   * @protected
   * @type {Set<Weapon>}
   */
  protected _unhurt_weapons: Set<Weapon> = new Set<Weapon>();
  get_gravity(e: Weapon) {
    return e.world.gravity * 0.5
  };
  enter(e: Weapon, prev_frame: IFrameInfo): void {
    this._unhurt_weapons.add(e);
  }
  leave(e: Weapon, next_frame: IFrameInfo): void {
    this._unhurt_weapons.delete(e);
  }
  on_landing(e: Weapon, vx: number, vy: number, vz: number): void {
    const { base, indexes } = e.data
    const dvy = Math.floor(-vy * base.bounce);
    const min_bounce_vy = 2;
    if (dvy < min_bounce_vy) {
      e.enter_frame(indexes.throw_on_ground || indexes.just_on_ground)
    } else {
      e.velocity.y = dvy;
    }
    if (this._unhurt_weapons.has(e)) {
      this._unhurt_weapons.delete(e);
      if (base.weapon_drop_hurt) e.hp -= base.weapon_drop_hurt;
    }
    const sound_name = e.hp <= 0 ?
      base.weapon_broken_sound :
      base.weapon_drop_sound;
    if (sound_name) {
      const { x, y, z } = e.position;
      e.world.lf2.sounds.play(sound_name, x, y, z);
    }
  }
}
